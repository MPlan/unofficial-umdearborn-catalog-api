# Unofficial course catalog APIs for the University of Michigan-Dearborn

The purpose of this project is to be a fast and reliable course catalog API for MPlan. There are three goals to this service:

* fetch and parse data from the UMConnect portal available at [selfservice.umd.umich.edu](https://selfservice.umd.umich.edu).
* copy and persist to another faster database for service reliability and speed
* schedule reoccurring jobs to fetch and update copied data

# High-level architecture

* each day (or on some other schedule) a job will run that will extract data from the UMConnect portal into our own database via web scraping
* each request to this web API will hit our copied database to return a result
* a web UI may be created in order to monitor and log the output of the extract jobs from the UMConnect portal. additionally this UI may enable restoration of previous backups of this database in the event that an extract job has rendered newest dataset erroneous

notes:

* the latest semester available will be used to determine the current mastered list of courses in the catalog. E.g. if a course X was visible in term 201710 but not in 201720, then course X will no longer exist. if course X had course Y as prerequisite in term 201810 but not in 201820, then course X no longer has course Y as a prerequisite.

# Questions we want to ask the data:

* What courses are required to take course X?
* Has course X been offered during semester Y?
* Has course X been completely filled during semester Y?
* What courses satisfy degree requirement X?

* Has course X been offered online during semester Y?
* What is this course cross-listed as?

# Planned endpoints:

```
# gets all the subjects available in the most recent semester's catalog
GET /api/catalog

```

```json
{
  "CIS": {
    "450": {
      "name": "Operating Systems",
      "description": "Introduction to computer operating systems. Proces...",
      "credits": 4,
      "creditsMin": null,
      "restrictions": [],
      "prerequisites": {
        "g": "&",
        "o": [
          ["CIS", "999"],
          "Remedial Math",
          {
            "g": "|",
            "o": [
              ["CIS", "350"],
              ["ECE", "999"]
            ]
          },
          {
            "g": "|",
            "o": [
              ["CIS", "999"],
              ["ECE", "999"]
            ]
          }
        ]
      },
      "crossList": ["ECE", "478"],
      "sections": {
        "201820": [
          {
            "ins": "shqwang",
            "typ": "Lecture",
            "tim": "4:00 pm - 5:45 pm",
            "day": "TR",
            "loc": "Professional Education Center 1430",
            "cap": 30,
            "rem": 5
          },
          {
            "ins": "shqwang",
            "typ": "Internet",
            "tim": "TBA",
            "day": "",
            "loc": "Internet Instruction",
            "cap": 20,
            "rem": 10
          }
        ],
        "201810": [
          {
            "ins": "shqwang",
            "typ": "Lecture",
            "tim": "4:00 pm - 5:45 pm",
            "day": "TR",
            "loc": "Professional Education Center 1430",
            "cap": 30,
            "rem": 5
          }
        ]
      }
    }
  }
}
```
