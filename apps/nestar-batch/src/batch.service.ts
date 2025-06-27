import { Injectable } from '@nestjs/common';

@Injectable()
export class BatchService {
  public getHello(): string {
    return 'Welcome to Nestar BATCH Server!';
  }

  public async batchRollback(): Promise<void> {
    // TODO: Rollback logic here
    console.log("batchRollback")
  }

  public async batchProperties(): Promise<void> {
    // TODO: Properties batch logic here
    console.log("batchProperties")
  }

  public async batchAgents(): Promise<void> {
    // TODO: Agents batch logic here
    console.log("batchAgents")
  }
}
