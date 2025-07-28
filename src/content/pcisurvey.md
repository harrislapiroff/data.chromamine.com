---
title: PCI Communication Survey
sidebar: false
toc: true
---

# PCI Communications Survey

This survey was conducted in 2025. Survey responses were opened on March 24th – sent out through the Pinewoods email list Articles and Announcements - and later posted on Instagram on May 17th. I'm not sure if they were ever posted on Facebook or other platforms. We also did not publish on the website.

Due to some of the haphazard data collection, I'd caution a few limitations:

* The group that reads emails had the most reminders of the survey (we sent it out twice) and therefore results may bias toward email readers.
* Along similar lines, emails are guaranteed to end up in a reader's inbox but social media algorithms may not present our posts to all out followers, which would increase that bias (though also tells us something interesting about the reliability of social media as a communication channel).
* Because I didn't think we got a representative sample across all age groups, I've presented all results broken down by age group.
* Two age groups had very few responses: 18-25 (n=2) and 46-55 (n=4) and their results may not tell us much.

Nevertheless, I draw the following tentative conclusions from the data:

* Email remains the most consistent communication channel across age groups older than 25.
* People are interested in a fairly even spread of different content types in our A&A emails.
* Remarkably few people had trouble finding information about camp that they wanted. This suggests that our website, though old, may still be doing its job.

Future recommendations:

* There remains some dissatisfaction on the board with the website. It would be interesting to explore the reasons for that from a board perspective instead of a site visitor perspective. Some possible explanations:
  * The website requires more maintenance from the board than it should.
  * The website, though serviceable, has an old design and the board would like to project an image of a more modern professional organization.
* We should post a simple ongoing feedback survey on the website in a permanent location and establish a plan for checking results from it.
* Do some user testing, asking people to find specific information about camp, and observing what they do to find it.

Remaining tasks to do on this data:

* Break down social media platforms
* Add a comprehensive list of all free response answers and write-in responses at the bottom of the document

```js
import { parse } from 'npm:date-fns'
import { parse as md } from 'npm:marked'

const socialMediaNones = [
    '',
    'I do  not prefer social media',
    'NONE - try to avoid social media altogether!',
    'Social media depends too much on chance. It\'s a mistake to rely on it. Emails best.',
    'no social media',
    'None',
]

const data = (await FileAttachment('../data/pcisurvey.csv').csv()).map(d => ({
    currentMedia: d['How do you currently get information about or hear from Pinewoods?'].split(';'),
    currentMediaDetails: d['Share any other details about how you currently get information about Pinewoods'],
    preferMedia: d['How would you prefer to get information about or hear from Pinewoods?'].split(';'),
    preferPlatform: d['If you prefer social media, which platforms?'].split(';').map(d => socialMediaNones.includes(d) ? '(none)' : d),
    preferTypes: d['What types of communications would you like to receive from Pinewoods in our A&A and social media?'].split(';'),
    preferMediaDetails: d['Share any other details about how you would like to get information from Pinewoods'],
    missingInfo: d['In the past year, was there any information you wanted about Pinewoods that was challenging to find?'],
    preferAAFrequency: d['Currently we send out Articles and Announcements by email every month in the off season and every other month during camp season. How is this frequency?'],
    age: d['What is your age group?'],
}))

const ageOptions = new Set(data.map(d => d.age))
const currentMediaOptionsOfficial = [
    'Word of mouth',
    'Social media (Facebook, Instagram)',
    'Email',
    'Physical Mail',
    'Pinewoods.org',
    'Other websites (specify below)',
]
const preferMediaOptionsOfficial = [
    'Word of mouth',
    'Social media',
    'Email',
    'Physical mail',
    'Websites',
]

const preferTypesOptionsOfficial = [
    'Camper logistics (packing list, directions, camp tips useful for all sessions)',
    'Crew information (job openings, schedule, etc.)',
    'Volunteer opportunities',
    'Scholarships',
    'Memories of camp (photos, videos, stories, etc. from recent seasons)',
    'Camp in the off-season (photos, stories, behind-the-scenes information)',
    'Camp history',
    'Six Ponds (photos, stories, etc. from Pinewoods geographic region)',
    'Zoom series information and other camp virtual events',
]

const preferredMediaUnrolled = aq.fromJSON(data).unroll('preferMedia', { index: 'idx' }) 
const currentMediaUnrolled = aq.fromJSON(data).unroll('currentMedia', { index: 'idx' })   
const preferTypesUnrolled = aq.fromJSON(data).unroll('preferTypes', { index: 'idx' })
const preferPlatformUnrolled = aq.fromJSON(data).unroll('preferPlatform', { index: 'idx' })

const groupedByAge = d3.rollup(data, v => v.length, d => d.age)

const commonOptions = {
    width: 600,
    marginLeft: 200,
    marginRight: 75,
    fy: { axis: 'right', label: null, tickFormat: d => `${d} (n=${groupedByAge.get(d)})` },
    x: { axis: 'both', tickFormat: d3.format('.0%'), grid: true, tickSize: 0 },
    y: { tickSize: 0, label: null },
}

const barAndText = (filteredData, field) => {
    return [
        Plot.barX(
            filteredData,
            Plot.groupY(
                {
                    // Number of people who prefer this platform as a percentage of the total number of people in this age group
                    x: D => D.length / filteredData.filter(d => d.age === D[0].age).length,
                },
                {
                    y: field,
                    fy: 'age',
                    fill: field,
                }
            ),
        ),
        Plot.text(
            filteredData,
            Plot.groupY(
                {
                    // Number of people who prefer this platform as a percentage of the total number of people in this age group
                    x: D => D.length / filteredData.filter(d => d.age === D[0].age).length,
                    text: D => `${D.length} (${d3.format('.0%')(D.length / filteredData.filter(d => d.age === D[0].age).length)})`,
                },
                {
                    y: field,
                    fy: 'age',
                    fill: '#000',
                    textAnchor: 'end',
                }
            )
        )
    ]
}
```

## How do you currently get information about or hear from Pinewoods?

```js
Plot.plot({
    ...commonOptions,
    marks: [
        barAndText(
            currentMediaUnrolled.objects().filter(d => currentMediaOptionsOfficial.includes(d.currentMedia) && !!d.age),
            'currentMedia'
        ),
        Plot.frame(),
    ]
})
```

## How would you prefer to get information about or hear from Pinewoods?

```js
Plot.plot({
    ...commonOptions,
    marks: [
        barAndText(
            preferredMediaUnrolled.objects().filter(d => preferMediaOptionsOfficial.includes(d.preferMedia) && !!d.age),
            'preferMedia'
        ),
        Plot.frame(),
    ]
})
```

## What types of communications would you like to receive from Pinewoods in our A&A and social media?

```js
Plot.plot({
    ...commonOptions,
    marginLeft: 350,
    marks: [
        barAndText(
            preferTypesUnrolled.objects().filter(d => preferTypesOptionsOfficial.includes(d.preferTypes) && !!d.age),
            'preferTypes'
        ),
        Plot.frame(),
    ]
})
```

## If you prefer social media, which platforms?

Of respondents who replied to this question:

```js
Plot.plot({
    ...commonOptions,
    marginLeft: 75,
    width: 400,
    marks: [
        barAndText(
            preferPlatformUnrolled.objects().filter(d => !!d.preferPlatform && d.preferPlatform !== '(none)' && !!d.age),
            'preferPlatform'
        ),
        Plot.frame(),
    ]
})
```

## All Responses

```js
const allData = aq.from(await FileAttachment('../data/pcisurvey.csv').csv())
```

${allData.columnNames().filter(c => !['Timestamp', 'What is your age group?', 'If you\'re open to follow up about your responses, please leave a name and contact information'].includes(c)).map(c => htl.html`
    <h3>${c}</h3>
    <ul>
        ${
            Array.from(d3.group(
                allData.column(c).flatMap(c => c.split(';')),
                d => d
            ))
                .sort((a, b) => b[1].length - a[1].length)
                .filter(([k, v]) => k !== '')
                .map(
                    ([k, v]) => htl.html`<li>${k} (${v.length})</li>`
                )
        }
    </ul>
`)}