import asyncio
import json
import sys
import tempfile
import time
from pathlib import Path

from playwright.async_api import Page, async_playwright


APP_URL = "http://localhost:5173"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
STALE_STATE = Path(tempfile.gettempdir()) / "sih-2026-stale-storage.json"
GRAPH_SCREENSHOT = Path(tempfile.gettempdir()) / "sih-2026-graph.png"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


async def open_browser(playwright, *, storage_state: str | None = None):
    browser = await playwright.chromium.launch(
        executable_path=CHROME,
        headless=True,
        args=["--disable-gpu"],
    )
    context = await browser.new_context(
        viewport={"width": 1440, "height": 1000},
        accept_downloads=True,
        storage_state=storage_state,
    )
    return browser, context


async def body_json(response):
    text = await response.text()
    try:
        return json.loads(text), text
    except json.JSONDecodeError:
        return None, text


async def login(page: Page) -> dict:
    await page.goto(f"{APP_URL}/login")
    await page.locator('input[placeholder="demo"]').fill("admin")
    await page.locator('input[type="password"]').fill("admin123")
    async with page.expect_response(
        lambda response: response.request.method == "POST" and response.url.endswith("/api/v1/auth/login")
    ) as pending:
        await page.get_by_role("button", name="Sign in").click()
    response = await pending.value
    data, text = await body_json(response)
    require(response.status == 200, f"Login failed: HTTP {response.status} {text}")
    await page.wait_for_url("**/dashboard")
    await page.get_by_role("heading", name="Financial Intelligence Dashboard").wait_for()
    safe_data = {
        "success": data.get("success"),
        "data": {
            "token_type": data.get("data", {}).get("token_type"),
            "expires_in": data.get("data", {}).get("expires_in"),
            "user": data.get("data", {}).get("user"),
            "access_token": "<redacted>",
        },
    }
    return {"status": response.status, "body": safe_data}


async def open_case_count(page: Page) -> int:
    await page.goto(f"{APP_URL}/dashboard")
    await page.get_by_text("Open cases", exact=True).wait_for()
    card = page.get_by_text("Open cases", exact=True).locator("..")
    value = ""
    for _ in range(50):
        value = (await card.locator("p").nth(1).inner_text()).strip()
        if value.isdigit():
            return int(value)
        await page.wait_for_timeout(200)
    raise AssertionError(f"Open case count did not leave its loading state: {value}")


async def add_wallet(page: Page, chain: str, address: str, request_log: list[dict]) -> dict:
    await page.get_by_role("button", name="+ Add Wallet").click()
    modal = page.locator("div.fixed.inset-0")
    await modal.get_by_role("heading", name="Add Suspect Wallet").wait_for()
    await modal.locator("select").select_option(chain)
    await modal.locator('input[placeholder="0x…"]').fill(address)
    async with page.expect_response(
        lambda response: response.request.method == "POST" and "/wallets" in response.url
    ) as pending:
        await modal.get_by_role("button", name="Add Wallet").click()
    response = await pending.value
    data, text = await body_json(response)
    request_log.append({"method": "POST", "url": response.url, "status": response.status, "body": data or text})
    require(response.status == 200, f"Add wallet failed: HTTP {response.status} {text}")
    await page.locator(f'span[title="{address}"]').wait_for()
    return data


async def start_investigation(page: Page, address: str, request_log: list[dict]) -> tuple[str, dict]:
    wallet_start = page.locator(
        f'xpath=//span[@title="{address}"]/ancestor::div[.//button[normalize-space()="Start Investigation"]][1]//button[normalize-space()="Start Investigation"]'
    )
    await wallet_start.click()
    await page.wait_for_url("**/investigations/new?**")
    require(await page.locator("select").input_value() == "mock", "Mock chain was not preserved in the start form")
    require(await page.locator("form.space-y-5 input:not([type])").input_value() == address, "Start address was not preserved in the start form")

    post_responses: list = []

    async def capture(response):
        if response.request.method == "POST" and response.url.endswith("/api/v1/investigations"):
            post_responses.append(response)

    page.on("response", capture)
    await page.get_by_role("button", name="Start Investigation").click()
    await page.wait_for_url("**/investigations/*/progress")
    await page.wait_for_url("**/investigations/*/graph", timeout=30_000)
    await page.wait_for_timeout(500)
    page.remove_listener("response", capture)
    require(len(post_responses) == 1, f"Expected exactly one investigation POST, observed {len(post_responses)}")
    response = post_responses[0]
    data, text = await body_json(response)
    request_log.append({"method": "POST", "url": response.url, "status": response.status, "body": data or text})
    require(response.status == 200, f"Start investigation failed: HTTP {response.status} {text}")
    created = data["data"]
    require(created["startChain"] == "mock", f"Backend changed chain: {created}")
    require(created["startAddress"] == address, f"Backend changed start address: {created}")
    require(created["status"] in {"IN_PROGRESS", "PENDING", "RUNNING", "COMPLETED"}, f"Unexpected initial status: {created}")
    return created["id"], created


async def full_flow() -> None:
    result: dict[str, object] = {"checks": {}, "api": [], "console": [], "page_errors": []}
    checks: dict[str, object] = result["checks"]  # type: ignore[assignment]
    request_log: list[dict] = result["api"]  # type: ignore[assignment]

    async with async_playwright() as playwright:
        browser, context = await open_browser(playwright)
        page = await context.new_page()
        page.on("console", lambda message: result["console"].append({"level": message.type, "text": message.text}))  # type: ignore[union-attr]
        page.on("pageerror", lambda error: result["page_errors"].append(str(error)))  # type: ignore[union-attr]

        await page.goto(f"{APP_URL}/login")
        await page.evaluate("localStorage.clear()")
        await page.reload()
        login_result = await login(page)
        request_log.append({"method": "POST", "url": "/api/v1/auth/login", **login_result})
        checks["login"] = "PASS"

        async with page.expect_response(lambda response: response.url.endswith("/api/v1/auth/me")) as pending_me:
            await page.reload()
        me_response = await pending_me.value
        me_data, me_text = await body_json(me_response)
        request_log.append({"method": "GET", "url": me_response.url, "status": me_response.status, "body": me_data or me_text})
        require(me_response.status == 200, f"Hard-refresh auth failed: {me_response.status} {me_text}")
        await page.get_by_role("heading", name="Financial Intelligence Dashboard").wait_for()
        checks["hard_refresh_auth"] = "PASS"

        initial_count = await open_case_count(page)
        unique = int(time.time())
        case_number = f"SIH-E2E-{unique}"
        case_title = f"SIH E2E Attribution {unique}"
        await page.goto(f"{APP_URL}/cases/new")
        await page.locator('input[placeholder="SIH-2026-001"]').fill(case_number)
        await page.locator('input[placeholder^="Crypto Fraud Case"]').fill(case_title)
        await page.locator("textarea").fill("Verified browser workflow for PS 26182")
        await page.locator("select").select_option("high")
        async with page.expect_response(
            lambda response: response.request.method == "POST" and response.url.endswith("/api/v1/cases")
        ) as pending_case:
            await page.get_by_role("button", name="Create Case").click()
        case_response = await pending_case.value
        case_data, case_text = await body_json(case_response)
        request_log.append({"method": "POST", "url": case_response.url, "status": case_response.status, "body": case_data or case_text})
        require(case_response.status == 200, f"Create case failed: HTTP {case_response.status} {case_text}")
        case_id = case_data["data"]["id"]
        await page.wait_for_url(f"**/cases/{case_id}")
        await page.get_by_role("heading", name=case_title).wait_for()
        checks["create_case"] = "PASS"
        checks["priority_label"] = "PASS" if "HIGH PRIORITY" in await page.locator("body").inner_text() else "FAIL"

        updated_count = await open_case_count(page)
        require(updated_count == initial_count + 1, f"Case count did not update: {initial_count} -> {updated_count}")
        checks["case_counts"] = {"status": "PASS", "before": initial_count, "after": updated_count}
        await page.goto(f"{APP_URL}/cases/{case_id}")

        await page.get_by_role("button", name="+ Add Wallet").click()
        modal = page.locator("div.fixed.inset-0")
        await modal.locator("select").select_option("polygon")
        await modal.locator('input[placeholder="0x…"]').fill("knjbhvgcfxd")
        await modal.get_by_role("button", name="Add Wallet").click()
        await modal.get_by_text("EVM addresses must be 0x followed by 40 hexadecimal characters.").wait_for()
        await page.wait_for_timeout(300)
        await modal.get_by_role("button", name="×").click()
        checks["invalid_wallet_rejected"] = "PASS"

        await add_wallet(page, "mock", "node-114", request_log)
        await add_wallet(page, "mock", "node-145", request_log)
        checks["valid_mock_wallets"] = "PASS"

        investigation_145, created_145 = await start_investigation(page, "node-145", request_log)
        checks["node_145_mock_propagation"] = "PASS"
        checks["node_145_single_post"] = "PASS"
        checks["status_normalization"] = {"status": "PASS", "backend_initial": created_145["status"], "frontend_reached": "graph"}

        await page.goto(f"{APP_URL}/cases/{case_id}")
        await page.locator('span[title="node-114"]').wait_for()
        investigation_114, _created_114 = await start_investigation(page, "node-114", request_log)
        checks["node_114_single_post"] = "PASS"
        checks["investigation_progress"] = "PASS"

        async with page.expect_response(
            lambda response: response.url == f"http://localhost:8081/api/v1/investigations/{investigation_114}/graph"
        ) as pending_graph:
            await page.reload()
        graph_response = await pending_graph.value
        graph_data, graph_text = await body_json(graph_response)
        graph_summary = graph_text
        if graph_data:
            graph_summary = {
                "success": graph_data.get("success"),
                "node_count": len(graph_data.get("data", {}).get("nodes", [])),
                "edge_count": len(graph_data.get("data", {}).get("edges", [])),
            }
        request_log.append({"method": "GET", "url": graph_response.url, "status": graph_response.status, "body": graph_summary})
        require(graph_response.status == 200, f"Graph fetch failed: {graph_response.status} {graph_text}")

        await page.get_by_role("heading", name="Investigation Graph").wait_for()
        await page.get_by_text("Mock Dataset VASP", exact=True).wait_for(timeout=15_000)
        body = await page.locator("body").inner_text()
        for expected in ("nearest identified vasp", "node-10", "hop 1", "88.12 usdt"):
            require(expected in body.lower(), f"Graph missing visible VASP detail: {expected}")
        require(await page.get_by_role("button", name="→ Go to Start").is_visible(), "Go to Start is missing")
        require(await page.get_by_role("button", name="→ Go to VASP").is_visible(), "Go to VASP is missing")
        require(await page.get_by_role("button", name="→ Fit Visible").is_visible(), "Fit Visible is missing")
        view_select = page.locator("select").first
        options = await view_select.locator("option").all_text_contents()
        require(options == ["Attribution Path", "1 Hop", "2 Hops", "Full Graph"], f"Unexpected graph modes: {options}")
        await view_select.select_option("1hop")
        await page.get_by_role("button", name="→ Go to Start").click()
        await view_select.select_option("full")
        await page.get_by_role("button", name="→ Go to VASP").click()
        await page.get_by_role("button", name="→ Fit Visible").click()
        await view_select.select_option("attribution")
        await page.wait_for_timeout(800)
        await page.screenshot(path=str(GRAPH_SCREENSHOT), full_page=True)
        relevant_console = [entry["text"] for entry in result["console"] if "orphan edge count" in entry["text"]]  # type: ignore[index]
        require(any("orphan edge count = 0" in text for text in relevant_console), f"No zero-orphan validation log: {relevant_console}")
        require(not result["page_errors"], f"Browser page exceptions: {result['page_errors']}")
        checks["graph"] = {"status": "PASS", "modes": options, "orphan_logs": relevant_console, "screenshot": str(GRAPH_SCREENSHOT)}

        await page.get_by_role("link", name="View Findings").click()
        await page.wait_for_url(f"**/investigations/{investigation_114}/findings")
        await page.get_by_text("Nearest Identified VASP", exact=True).wait_for()
        findings_body = await page.locator("body").inner_text()
        require("Mock Dataset VASP" in findings_body, "Nearest VASP card is missing on findings page")
        require("vasp exposure identified" in findings_body.lower(), "Canonical VASP exposure finding is missing")
        checks["findings"] = "PASS"

        await page.goto(f"{APP_URL}/explorer")
        await page.get_by_role("heading", name="Investigation Explorer").wait_for()
        investigation_button = page.get_by_role("button").filter(has_text=investigation_114)
        await investigation_button.click()
        await page.get_by_role("link", name="Open full graph →").wait_for(timeout=15_000)
        require("Could not load graph preview" not in await page.locator("body").inner_text(), "Explorer preview is in an error state")
        checks["explorer_preview"] = "PASS"

        await page.goto(f"{APP_URL}/reports/new?investigation_id={investigation_114}")
        await page.get_by_role("heading", name="Generate Report").wait_for()
        await page.locator("select").select_option(investigation_114)
        report_post_requests: list = []

        def capture_report_request(request):
            if request.method == "POST" and request.url.endswith(f"/investigations/{investigation_114}/reports"):
                report_post_requests.append(request)

        page.on("request", capture_report_request)
        async with page.expect_response(
            lambda response: response.request.method == "POST" and response.url.endswith(f"/investigations/{investigation_114}/reports")
        ) as pending_report:
            await page.get_by_role("button", name="Generate Report").click()
        report_response = await pending_report.value
        await page.wait_for_url("**/reports/*")
        page.remove_listener("request", capture_report_request)
        require(len(report_post_requests) == 1, f"Expected one report POST, observed {len(report_post_requests)}")
        report_data, report_text = await body_json(report_response)
        report_summary = report_data or report_text
        if report_data:
            report_summary = {
                "success": report_data.get("success"),
                "data": {key: value for key, value in report_data.get("data", {}).items() if key != "content"},
            }
        request_log.append({"method": "POST", "url": report_response.url, "status": report_response.status, "body": report_summary})
        require(report_response.status == 200, f"Report generation failed: {report_response.status} {report_text}")
        report_id = report_data["data"]["id"]
        await page.get_by_role("heading", name="PDF Report Ready").wait_for()
        async with page.expect_download() as pending_download:
            await page.get_by_role("button", name="Download PDF Report").click()
        download = await pending_download.value
        download_path = await download.path()
        pdf_bytes = Path(download_path).read_bytes()
        require(pdf_bytes.startswith(b"%PDF"), "Downloaded report is not a PDF")
        checks["report"] = {"status": "PASS", "report_id": report_id, "post_count": len(report_post_requests), "pdf_bytes": len(pdf_bytes)}

        result["ids"] = {
            "case": case_id,
            "node_145_investigation": investigation_145,
            "node_114_investigation": investigation_114,
            "report": report_id,
        }
        result["final_url"] = page.url
        print(json.dumps(result, indent=2))
        await context.close()
        await browser.close()


async def prepare_stale_state() -> None:
    async with async_playwright() as playwright:
        browser, context = await open_browser(playwright)
        page = await context.new_page()
        await page.goto(f"{APP_URL}/login")
        await page.evaluate("localStorage.clear()")
        await page.reload()
        login_result = await login(page)
        token_keys = await page.evaluate("Object.keys(localStorage).filter(key => key.toLowerCase().includes('token'))")
        require(token_keys == ["sih_auth_token"], f"Unexpected token keys: {token_keys}")
        await context.storage_state(path=str(STALE_STATE))
        print(json.dumps({"status": "PASS", "storage_state": str(STALE_STATE), "token_keys": token_keys, "login": login_result}, indent=2))
        await context.close()
        await browser.close()


async def verify_stale_state() -> None:
    require(STALE_STATE.exists(), f"Missing stale storage state: {STALE_STATE}")
    async with async_playwright() as playwright:
        browser, context = await open_browser(playwright, storage_state=str(STALE_STATE))
        page = await context.new_page()
        auth_me: list[dict] = []

        async def capture(response):
            if response.url.endswith("/api/v1/auth/me"):
                data, text = await body_json(response)
                auth_me.append({"status": response.status, "body": data or text})

        page.on("response", capture)
        await page.goto(f"{APP_URL}/dashboard")
        await page.wait_for_url("**/login")
        await page.get_by_role("button", name="Sign in").wait_for()
        await page.wait_for_timeout(300)
        token_keys = await page.evaluate("Object.keys(localStorage).filter(key => key.toLowerCase().includes('token'))")
        require(token_keys == [], f"Stale token was not cleared: {token_keys}")
        require(len(auth_me) >= 1, f"Expected auth/me validation, observed {auth_me}")
        require(all(item["status"] in {401, 403} for item in auth_me), f"Stale auth/me was not rejected: {auth_me}")
        relogin = await login(page)
        result = {
            "status": "PASS",
            "redirected_to_login": True,
            "token_keys_after_rejection": token_keys,
            "auth_me": auth_me,
            "relogin": relogin,
            "final_url": page.url,
        }
        print(json.dumps(result, indent=2))
        await context.close()
        await browser.close()
    STALE_STATE.unlink(missing_ok=True)


async def verify_existing_empty_state(investigation_id: str, report_id: str) -> None:
    async with async_playwright() as playwright:
        browser, context = await open_browser(playwright)
        page = await context.new_page()
        page_errors: list[str] = []
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        await login(page)

        await page.goto(f"{APP_URL}/investigations/{investigation_id}/graph")
        await page.get_by_role("heading", name="Investigation Graph").wait_for()
        await page.get_by_text("No identified VASP reached in this investigation.").wait_for(timeout=15_000)
        graph_mode = page.locator("select").first
        require(await graph_mode.input_value() == "1hop", f"No-attribution graph did not default to 1 Hop: {await graph_mode.input_value()}")
        modes = await graph_mode.locator("option").all_text_contents()
        require(modes == ["1 Hop", "2 Hops", "Full Graph"], f"No-attribution graph exposed incorrect modes: {modes}")

        await page.goto(f"{APP_URL}/investigations/{investigation_id}/findings")
        await page.get_by_text("No findings detected for this investigation.", exact=True).wait_for(timeout=15_000)

        await page.goto(f"{APP_URL}/reports")
        await page.get_by_text(report_id, exact=True).wait_for(timeout=15_000)
        require(not page_errors, f"Browser page exceptions: {page_errors}")
        print(json.dumps({
            "status": "PASS",
            "no_attribution_default": "1 Hop",
            "available_modes": modes,
            "completed_empty_message": "No findings detected for this investigation.",
            "report_visible": report_id,
            "page_errors": page_errors,
        }, indent=2))
        await context.close()
        await browser.close()


async def verify_create_case_error(case_number: str) -> None:
    async with async_playwright() as playwright:
        browser, context = await open_browser(playwright)
        page = await context.new_page()
        await login(page)
        await page.goto(f"{APP_URL}/cases/new")
        await page.locator('input[placeholder="SIH-2026-001"]').fill(case_number)
        await page.locator('input[placeholder^="Crypto Fraud Case"]').fill("Duplicate case error check")
        async with page.expect_response(
            lambda response: response.request.method == "POST" and response.url.endswith("/api/v1/cases")
        ) as pending:
            await page.get_by_role("button", name="Create Case").click()
        response = await pending.value
        data, text = await body_json(response)
        message = data.get("error", {}).get("message") if data else text
        require(response.status >= 400, f"Duplicate case unexpectedly succeeded: {response.status} {text}")
        await page.get_by_role("alert").get_by_text(message, exact=True).wait_for()
        print(json.dumps({"status": "PASS", "http_status": response.status, "body": data, "visible_error": message}, indent=2))
        await context.close()
        await browser.close()


async def main() -> None:
    mode = sys.argv[1] if len(sys.argv) > 1 else "full"
    if mode == "full":
        await full_flow()
    elif mode == "prepare-stale":
        await prepare_stale_state()
    elif mode == "verify-stale":
        await verify_stale_state()
    elif mode == "verify-existing":
        await verify_existing_empty_state(sys.argv[2], sys.argv[3])
    elif mode == "verify-create-error":
        await verify_create_case_error(sys.argv[2])
    else:
        raise SystemExit(f"Unknown mode: {mode}")


if __name__ == "__main__":
    asyncio.run(main())
