import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Axios, { AxiosInstance } from 'axios';

@Injectable()
export class AuthorizeService {
  private client: AxiosInstance;
  constructor(configService: ConfigService) {
    this.client = Axios.create({
      baseURL: configService.getOrThrow('AUTHORIZATION_BASEURL'),
    });
  }

  getUserInfomation = async (token: string) => {
    const res = await this.client.get<UserDto>('user/information', {
      headers: {
        token,
      },
    });
    return res.data;
  };
}

export interface UserDto {
  token: string;
  // User Infomation
  userId: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  tel: string;
  isMasterUser: boolean;
  isSml: boolean;
  susr1: string;
  susr2: string;
  susr3: string;
  susr4: string;
  susr5: string;

  // Client Infomation
  clientId: string;
  clientCode: string;
  isMasterClient: boolean;
  domain: string;
  socketUrl: string;
  socketKey: string;
  backendUrl: string;
  ignoreExternReceiptKey: boolean;
  ignoreExternOrderKey: boolean;
  // Menu Infomation
  menu: {
    [menuCode: string]: boolean;
  };

  warehouses: WarehouseDto[];

  strWarehouses: string;

  // Warehouse Infomation
  warehouse: {
    [warehouseCode: string]: WarehouseDto;
  };

  // LOGO URL
  logo?: string;
  branch: {
    [branchCode: string]: BranchDto;
  };
}
// type BranchDtoCustom1 = BranchDto & {whseid: string}
// interface BranchDtoCustom extends BranchDto {
//     whseid: string,

// }

export interface WarehouseDto {
  code: string; // Code của warehouse,

  type: 'DISTRIBUTION' | 'CFS'; // Type của warehouse,

  name: string; // Tên warehouse

  // Các quyền của user trên warehouseCode tương ứng
  claim: {
    [claimCode: string]: Permission;
  };

  // Danh sách storerCodes của warehouse đó
  storerCodes: string[];

  strOwners: string;

  // Danh sách storers của warehouse đó
  storers: StorerDto[];

  // Thông tin storer
  storer: {
    [storerkey: string]: StorerDto;
  };
  branchCode: string;
}

export interface StorerDto {
  code: string;
  type: 'DEFAULT' | 'XDOCK'; // Type của storer,
  name: string;
  address: string;
  phone: string;
  email: string;
  contact: string;
  lottable01: string;
  lottable02: string;
  lottable03: string;
  lottable04: string;
  lottable05: string;
  lottable06: string;
  lottable07: string;
  lottable08: string;
  lottable09: string;
  lottable10: string;
  lottable11: string;
  lottable12: string;
  susr1: string;
  susr2: string;
  susr3: string;
  susr4: string;
  susr5: string;
  qcverifyPallet: boolean;
  qcverifyCarton: boolean;
  qcverifyUnit: boolean;
  qcverifySusr1: boolean;
  isOmsUser: boolean;
  requireSupplierASN: boolean;
  requireExpectedReceiptdateASN: boolean;
  requireCustomerSO: boolean;
  requireRequestedShipdateSO: boolean;
  claim: {
    [claimCode: string]: Permission;
  };
}

export interface BranchDto {
  code: string;
  description: string;
  name: string;
  note: string;
  shortName: string;
  susr01: string;
  susr02: string;
  susr03: string;
  susr04: string;
  susr05: string;
  susr06: string;
  susr07: string;
  susr08: string;
  susr09: string;
  susr10: string;
}

export type Permission = 'READ' | 'CREATE' | 'EDIT' | 'DELETE';
