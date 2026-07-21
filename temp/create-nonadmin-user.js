const fs = require('node:fs')
const path = require('node:path')
const { createClient } = require('@supabase/supabase-js')

function readEnvValue(name) {
  const envPath = path.resolve('C:/Users/saysa/Desktop/work/apps/iora-studio/.env')
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    if (line.startsWith(`${name}=`)) {
      return line.slice(name.length + 1)
    }
  }

  return ''
}

async function main() {
  const url = readEnvValue('NEXT_PUBLIC_SUPABASE_URL')
  const key = readEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  const email = `codex-nonadmin-${Date.now()}@example.com`
  const password = 'CodexTest123!'
  const supabase = createClient(url, key)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Codex Non Admin',
        company_name: 'Codex Test Company',
      },
    },
  })

  if (error) {
    throw error
  }

  console.log(
    JSON.stringify(
      {
        email,
        password,
        session: Boolean(data.session),
        userId: data.user?.id ?? null,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
