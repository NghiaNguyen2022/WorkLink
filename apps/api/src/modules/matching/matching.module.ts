import { Module } from '@nestjs/common';

import { MatchingController } from './matching.controller';
import { MatchingScoreService } from './matching-score.service';
import { MatchingService } from './matching.service';

@Module({
  controllers: [MatchingController],
  providers: [MatchingService, MatchingScoreService],
  exports: [MatchingService],
})
export class MatchingModule {}
