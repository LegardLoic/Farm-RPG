import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { BuyBlacksmithOfferDto } from './dto/buy-blacksmith-offer.dto';
import { BuyVillageSeedDto } from './dto/buy-village-seed.dto';
import { SellVillageCropDto } from './dto/sell-village-crop.dto';
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

  @Get('village-market')
  async getVillageMarket(@Req() req: AuthenticatedRequest) {
    return {
      status: 'ok',
      shop: await this.shopsService.getVillageMarket(req.authUser!.id),
    };
  }

  @Post('village-market/buy-seed')
  async buyVillageSeed(
    @Req() req: AuthenticatedRequest,
    @Body() body: BuyVillageSeedDto,
  ) {
    return {
      status: 'ok',
      purchase: await this.shopsService.buyVillageSeed(
        req.authUser!.id,
        body.offerKey,
        body.quantity,
      ),
    };
  }

  @Post('village-market/sell-crop')
  async sellVillageCrop(
    @Req() req: AuthenticatedRequest,
    @Body() body: SellVillageCropDto,
  ) {
    return {
      status: 'ok',
      sale: await this.shopsService.sellVillageCrop(
        req.authUser!.id,
        body.itemKey,
        body.quantity,
      ),
    };
  }
}
