import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { BuyBlacksmithOfferDto } from './dto/buy-blacksmith-offer.dto';
import { ShopsService } from './shops.service';

@Controller('shops')
@UseGuards(AccessTokenGuard)
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get('blacksmith')
  async getBlacksmith(@Req() req: AuthenticatedRequest) {
    return {
      status: 'ok',
      shop: await this.shopsService.getBlacksmithShop(req.authUser!.id),
    };
  }

  @Post('blacksmith/buy')
  async buyBlacksmith(
    @Req() req: AuthenticatedRequest,
    @Body() body: BuyBlacksmithOfferDto,
  ) {
    return {
      status: 'ok',
      purchase: await this.shopsService.buyBlacksmithOffer(
        req.authUser!.id,
        body.offerKey,
        body.quantity,
      ),
    };
  }
}
