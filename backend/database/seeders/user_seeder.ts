import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class UserSeeder extends BaseSeeder {
  static environment = ['test', 'development']

  async run() {
    await User.firstOrCreate(
      { email: 'test@example.com' },
      {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }
    )
  }
}
