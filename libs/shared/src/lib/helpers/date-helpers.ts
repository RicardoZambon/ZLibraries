export class DateHelpers {
  static diffDays(initialDate: Date, finalDate: Date): number {
    const initialDateOnly: Date = new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate());
    const finalDateOnly: Date = new Date(finalDate.getFullYear(), finalDate.getMonth(), finalDate.getDate());
  
    const diff: number = initialDateOnly.getTime() - finalDateOnly.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}