const { chromium } = require('C:\\Users\\ASUS\\AppData\\Local\\OpenAI\\Codex\\runtimes\\cua_node\\b63ee7ee40c23b77\\bin\\node_modules\\playwright-core')

;(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  })
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 })
  const consoleErrors = []
  const failedRequests = []
  page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()))
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText}`))

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: /Trace Crypto Funds/ }).waitFor()
  await page.waitForTimeout(900)
  const homeDesktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  const homeMotion = await page.evaluate(() => ({
    nav: getComputedStyle(document.querySelector('.landing-nav-wrap')).animationName,
    hero: getComputedStyle(document.querySelector('.landing-hero h1')).animationName,
    grid: getComputedStyle(document.querySelector('.landing-hero-grid')).animationName,
  }))
  await page.screenshot({ path: '.aesthetic-home-desktop.png', fullPage: false })
  const graphSection = page.locator('.landing-graph-section')
  await graphSection.scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  await graphSection.screenshot({ path: '.aesthetic-home-graph.png' })

  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="username"]').fill('admin')
  await page.locator('input[name="password"]').fill('admin123')
  await page.getByRole('button', { name: 'Login' }).click()
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  await page.goto('http://localhost:5173/explorer', { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'Investigation Explorer' }).waitFor()
  await page.locator('.explorer-list-item').first().waitFor({ timeout: 15000 })
  await page.waitForTimeout(700)
  const explorerItems = await page.locator('.explorer-list-item').count()
  const explorerDesktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  await page.screenshot({ path: '.aesthetic-explorer-desktop.png', fullPage: false })
  await page.locator('.explorer-list-item').first().click()
  await page.getByRole('link', { name: /Open full graph/ }).waitFor({ timeout: 15000 })
  await page.waitForTimeout(900)
  const graphPreviewVisible = await page.getByRole('link', { name: /Open full graph/ }).isVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'Investigation Explorer' }).waitFor()
  await page.locator('.explorer-list-item').first().waitFor({ timeout: 15000 })
  const explorerMobile = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    sidebarWidth: document.querySelector('.app-sidebar')?.getBoundingClientRect().width,
    contentWidth: document.querySelector('.app-page-stage')?.getBoundingClientRect().width,
    workspaceDirection: getComputedStyle(document.querySelector('.explorer-workspace')).flexDirection,
  }))
  await page.screenshot({ path: '.aesthetic-explorer-mobile.png', fullPage: false })

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload({ waitUntil: 'domcontentloaded' })
  const reducedMotionAnimation = await page.locator('.landing-hero h1').evaluate((node) => getComputedStyle(node).animationName)

  console.log(JSON.stringify({
    homeDesktopOverflow,
    homeMotion,
    explorerItems,
    explorerDesktopOverflow,
    graphPreviewVisible,
    explorerMobile,
    reducedMotionAnimation,
    consoleErrors,
    failedRequests,
  }, null, 2))
  await browser.close()
})().catch((error) => {
  console.error(error)
  process.exit(1)
})
