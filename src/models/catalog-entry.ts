export interface CatalogEntry {
  subjectCode: string,
  courseNumber: string,
  name: string,
  detailHref: string,
  scheduleHrefs: { [scheduleType: string]: string },
}
