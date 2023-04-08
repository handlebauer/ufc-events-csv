import type { Cheerio, CheerioAPI } from 'cheerio'
import type { Env } from './index.js'
import { load as loadHtml } from 'cheerio'
import { json2csv } from 'json-2-csv'
// import { json2csv } from './_export.js'

let env: Env

export const getCsv = (url: string) =>
  fetch(url)
    .then(response =>
      response.ok === false
        ? Promise.reject(
            `Fetch failed: ${response.status} (${response.statusText})`
          )
        : response.text()
    )
    .then(loadHtml)
    .then($ => {
      const events: { [key: string]: string }[] = []
      $('.b-statistics__table-events tbody tr')
        .slice(1)
        .each(function () {
          const [$nameAndDate, $location] = $(this).find('td')
          const strEvent = $($nameAndDate).find('a').text().trim()
          const dateEvent = new Date(
            $($nameAndDate).find('span').text().trim()
          ).toLocaleDateString()
          const [city, state, country] = $($location).text().trim().split(', ')
          events.push({
            strEvent,
            strCity: `${city}, ${state}`,
            strCountry: country,
            dateEvent,
          })
        })
      return events
    })
    .then(json2csv)
