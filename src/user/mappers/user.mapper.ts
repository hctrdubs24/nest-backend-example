import { UserDTO } from '../dto/response-user.dto';
import { User } from '../entities/user.entity';

export class UserMapper {
  static toResponse(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      tokenVersion: user.tokenVersion,
    };
  }

  static toResponseList(users: User[]) {
    return users.map((user) => this.toResponse(user));
  }
}
