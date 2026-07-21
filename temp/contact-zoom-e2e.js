const path = require('path')
const { chromium } = require(path.join(process.cwd(), 'packages', 'ui', 'node_modules', 'playwright'))

const baseUrl = process.env.CONTACT_E2E_BASE_URL || 'http://localhost:3000'
const skipAnonScenario = process.env.CONTACT_E2E_SKIP_ANON === '1'

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function clickCalendarDay(page, targetDay) {
  const cells = page.locator("[data-slot='day-cell']")
  const count = await cells.count()

  for (let index = 0; index < count; index += 1) {
    const cell = cells.nth(index)
    const number = (await cell.locator("[data-slot='day-number']").textContent())?.trim()

    if (number === String(targetDay)) {
      await cell.click()
      return
    }
  }

  throw new Error(`Calendar day ${targetDay} not found.`)
}

async function selectDeadline(page, day) {
  await page.locator('#deadline').click()
  await page.waitForSelector("[role='dialog']")
  await clickCalendarDay(page, day)
  await page.getByRole('button', { name: '선택 완료' }).click()
}

async function selectZoomSchedule(page, config) {
  await page.locator('#zoomMeetingAt').click()
  await page.waitForSelector("[role='dialog']")

  const initialHint = page.getByText('먼저 캘린더에서 날짜를 선택해 주세요.')
  await initialHint.waitFor()

  await clickCalendarDay(page, config.fullDay)
  await initialHint.waitFor()

  const fullBadgeVisible = await page.getByText('예약마감').isVisible()
  assert(fullBadgeVisible, 'Expected fully booked day badge to be visible.')

  await clickCalendarDay(page, config.availableDay)
  await page.locator('#zoomMeetingTime').waitFor()

  const reservedOption = page.locator("#zoomMeetingTime option[value='11:30']")
  assert(await reservedOption.isDisabled(), 'Expected 11:30 option to be disabled.')

  await page.locator('#zoomMeetingTime').selectOption(config.time)
  await page.getByRole('button', { name: '선택 완료' }).click()
}

async function fillContactForm(page, values) {
  await page.locator('#name').fill(values.name)
  await page.locator('#email').fill(values.email)
  await page.locator('#phone').fill(values.phone)
  await page.locator('#serviceType').selectOption(values.serviceType)
  await page.locator('#budgetRange').selectOption(values.budgetRange)
  await selectDeadline(page, values.deadlineDay)
  await selectZoomSchedule(page, values.zoom)
  await page.locator('#referenceSite').fill(values.referenceSite)
  await page.locator('#backgroundTone').selectOption(values.backgroundTone)
  await page.locator('#pointColor').fill(values.pointColor)
  await page.locator('#requestDetails').fill(values.requestDetails)
  await page.locator("button[type='submit']").click()
  const submitMessage = page.locator("form [role='status']").last()
  await submitMessage.waitFor()
  return (await submitMessage.textContent())?.trim() ?? ''
}

async function run() {
  const browser = await chromium.launch({ headless: true })

  try {
    if (!skipAnonScenario) {
      const anonContext = await browser.newContext()
      const anonPage = await anonContext.newPage()
      await anonPage.goto(`${baseUrl}/contact`, { waitUntil: 'networkidle' })

      const anonMessage = await fillContactForm(anonPage, {
        name: '비회원 문의',
        email: 'anon-contact@example.com',
        phone: '010-4444-5555',
        serviceType: 'company-homepage',
        budgetRange: '100-300',
        deadlineDay: 24,
        zoom: {
          fullDay: 22,
          availableDay: 23,
          time: '10:30',
        },
        referenceSite: 'https://example.com',
        backgroundTone: 'dark',
        pointColor: 'lime',
        requestDetails: '비회원 문의 테스트입니다.',
      })
      console.log(`anon-message: ${anonMessage}`)
      await anonContext.close()
    }

    const authContext = await browser.newContext()
    const authPage = await authContext.newPage()
    await authPage.goto(`${baseUrl}/signin`, { waitUntil: 'networkidle' })
    await authPage.locator("input[type='email']").fill('member@example.com')
    await authPage.locator("input[type='password']").fill('12345678')
    await authPage.locator("button[type='submit']").click()
    await authPage.waitForTimeout(1500)

    await authPage.goto(`${baseUrl}/contact`, { waitUntil: 'networkidle' })
    const authMessage = await fillContactForm(authPage, {
      name: '회원 문의',
      email: 'auth-contact@example.com',
      phone: '010-6666-7777',
      serviceType: 'maintenance',
      budgetRange: '300-700',
      deadlineDay: 27,
      zoom: {
        fullDay: 22,
        availableDay: 23,
        time: '13:30',
      },
      referenceSite: 'https://iora.example.com',
      backgroundTone: 'neutral',
      pointColor: 'blue',
      requestDetails: '회원 문의 테스트입니다.',
    })
    console.log(`auth-message: ${authMessage}`)
    await authContext.close()

    console.log('contact-zoom-e2e-ok')
  } finally {
    await browser.close()
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
