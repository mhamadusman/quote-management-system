import Corridor from '#models/corridor'

export default class CorridorRepository {
  static async getByIds(ids: string[]): Promise<Corridor[]> {
    return Corridor.query().whereIn('id', ids)
  }
}
