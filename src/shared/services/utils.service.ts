import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  /**
   * Generate random string
   */
  generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Check if email is valid
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format date to string
   */
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Capitalize first letter
   */
  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Remove sensitive data from object
   */
  removeSensitiveData(obj: any, sensitiveFields: string[] = ['password', 'token']): any {
    const cleanObj = { ...obj };
    sensitiveFields.forEach(field => {
      if (cleanObj[field]) {
        delete cleanObj[field];
      }
    });
    return cleanObj;
  }
} 