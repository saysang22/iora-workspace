const path = require('path')
const { chromium } = require(path.join(process.cwd(), 'packages', 'ui', 'node_modules', 'playwright'))

const baseUrl = process.env.ADMIN_E2E_BASE_URL || 'http://127.0.0.1:3000'

async function run() {
  const browser = await chromium.launch({ headless: true })

  try {
    const page = await browser.newPage()
    await page.goto(`${baseUrl}/signin`, { waitUntil: 'domcontentloaded' })
    await page.locator("input[type='email']").fill('admin-local@example.com')
    await page.locator("input[type='password']").fill('12345678')
    await page.locator("button[type='submit']").click()
    await page.waitForTimeout(1200)

    await page.goto(`${baseUrl}/admin/projects`, { waitUntil: 'domcontentloaded' })

    const menuButton = page.getByRole('button', { name: /이오라 테스트 컴퍼니 관리/ })
    await menuButton.waitFor()
    await menuButton.click()

    const deleteButton = page.getByRole('button', { name: '삭제' })
    await deleteButton.waitFor()

    const visible = await deleteButton.isVisible()
    if (!visible) {
      throw new Error('케밥 메뉴에서 삭제 버튼이 보이지 않습니다.')
    }

    console.log('admin-projects-kebab-e2e-ok')
  } finally {
    await browser.close()
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
