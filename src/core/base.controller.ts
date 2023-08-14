export class BaseController {
  protected ok(data?: any, meta?: any) {
    return { message: 'success', data, meta };
  }
}
