import { CatalogEntry } from './catalog-entry';

interface Prerequisite {
  // logicGate: 'and' | 'or' | 
}

export interface Course extends CatalogEntry {
  /**
   * the description of the course taken directly from UMConnect
   */
  description: string,
  /**
   * the credit hours taken from the most recent sections of the most recent term of the course.
   */
  credits: number | undefined,
  /**
   * 
   */
  levels: string[],
  sections: number[],
  prerequisites: {}
}
