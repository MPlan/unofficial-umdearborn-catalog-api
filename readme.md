# Unofficial course catalog APIs for the University of Michigan-Dearborn

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