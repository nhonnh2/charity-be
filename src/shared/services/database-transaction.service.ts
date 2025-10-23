import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';

/**
 * Database Transaction Service
 * 
 * Provides a centralized way to handle database transactions across the application.
 * This service ensures consistent transaction handling and proper resource management.
 */
@Injectable()
export class DatabaseTransactionService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Execute operations within a database transaction
   * 
   * @param operation - Function containing database operations that need to be executed within a transaction
   * @returns Promise<T> - Result of the operation
   * 
   * @example
   * ```typescript
   * const result = await this.databaseTransactionService.withTransaction(async (session) => {
   *   const user = await this.userModel.create([userData], { session });
   *   const profile = await this.profileModel.create([profileData], { session });
   *   return { user, profile };
   * });
   * ```
   */
  async withTransaction<T>(operation: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();
    
    try {
      let result: T;
      await session.withTransaction(async () => {
        result = await operation(session);
      });
      return result!;
    } catch (error) {
      // Transaction will automatically rollback on error
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Execute operations within a database transaction with custom options
   * 
   * @param operation - Function containing database operations
   * @param options - Transaction options (readConcern, writeConcern, etc.)
   * @returns Promise<T> - Result of the operation
   */
  async withTransactionWithOptions<T>(
    operation: (session: ClientSession) => Promise<T>,
    options?: {
      readConcern?: any;
      writeConcern?: any;
      maxTimeMS?: number;
    }
  ): Promise<T> {
    const session = await this.connection.startSession();
    
    try {
      let result: T;
      await session.withTransaction(async () => {
        result = await operation(session);
      }, options);
      return result!;
    } catch (error) {
      // Transaction will automatically rollback on error
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get a new database session (for manual transaction management)
   * 
   * @returns Promise<ClientSession> - New database session
   * 
   * @example
   * ```typescript
   * const session = await this.databaseTransactionService.getSession();
   * try {
   *   await session.withTransaction(async () => {
   *     // Your operations here
   *   });
   * } finally {
   *   await session.endSession();
   * }
   * ```
   */
  async getSession(): Promise<ClientSession> {
    return await this.connection.startSession();
  }
}
