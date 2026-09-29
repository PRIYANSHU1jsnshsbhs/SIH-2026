import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        requests_info = []
        
        async def handle_response(response):
            if 'login' in response.url and response.request.method == 'POST':
                req = response.request
                post_data = req.post_data
                status = response.status
                body = await response.text()
                requests_info.append({
                    'url': req.url,
                    'post_data': post_data,
                    'status': status,
                    'response_body': body
                })

        page.on('response', handle_response)
        
        print('Navigating to http://localhost:5173/login...')
        await page.goto('http://localhost:5173/login')
        
        print('Waiting for input fields...')
        await page.wait_for_selector('input[placeholder="demo"]')
        await page.fill('input[placeholder="demo"]', 'admin')
        
        print('Typing password...')
        await page.fill('input[type="password"]', 'admin123')
        
        print('Clicking Sign in...')
        await page.click('button[type="submit"]')
        
        print('Waiting for network idle...')
        await page.wait_for_load_state('networkidle')
        
        print('Checking URL...')
        current_url = page.url
        print(f'Current URL after login: {current_url}')
        
        print('\n--- Network Logs ---')
        for info in requests_info:
            print(f"REQUEST URL: {info['url']}")
            print(f"REQUEST JSON: {info['post_data']}")
            print(f"HTTP STATUS: {info['status']}")
            print(f"RESPONSE JSON: {info['response_body']}")
            
        await browser.close()

asyncio.run(main())
