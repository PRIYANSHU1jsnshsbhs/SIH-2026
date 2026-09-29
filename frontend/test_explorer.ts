import { fetchAllInvestigations } from './src/api/investigations'

fetchAllInvestigations()
  .then((res) => {
    console.log(`Success! Found ${res.data.length} investigations.`)
  })
  .catch((err) => {
    console.error('Failed to fetch investigations:', err)
  })
