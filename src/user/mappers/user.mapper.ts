import { Role } from 'src/auth/enums/role.enum';
import { JwtUserDTO } from '../dto/response-user-jwt.dto';
import { UserDTO } from '../dto/response-user.dto';
import { User } from '../entities/user.entity';

export class UserMapper {
  static toResponse(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
    };
  }

  static toJwtSign(user: User): JwtUserDTO {
    let roleName: Role | undefined = undefined;
    if (user.roleId === 1) roleName = Role.ADMIN;
    else if (user.roleId === 2) roleName = Role.USER;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      tokenVersion: user.tokenVersion,
      roleName,
    };
  }

  static toResponseList(users: User[]) {
    return users.map((user) => this.toResponse(user));
  }
}
