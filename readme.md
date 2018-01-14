# Unofficial course catalog APIs for the University of Michigan-Dearborn

The purpose of this project is to be a fast and reliable course catalog API for MPlan. There are three goals to this service:

* fetch and parse data from the UMConnect portal available at [selfservice.umd.umich.edu](https://selfservice.umd.umich.edu).
* copy and persist to another faster database for service reliability and speed
* schedule reoccurring jobs to fetch and update copied data

Planned entities:

* CatalogEntry
  * subject
  * course number
  * title
  * description
  * credit hours
  * lecture hours?
  * level (e.g. undergraduate, graduate),
  * schedule type (e.g. lecture, recitation)
  * prerequisites (set of rules)
  * restrictions (class standing?)
  * department
  * course attributes?
* Section
  * CRN


```
GET /api/catalog/-term-/sub/number
GET /api/catalog/201820/CIS/150L
```