import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUsersDto, UserResponseDto, UserListResponseDto, DeleteUserResponseDto } from './dto';
import { TransformResponseDTO } from '../../shared/decorators';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: UserResponseDto
  })
  @TransformResponseDTO(UserResponseDto)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully',
    type: UserListResponseDto
  })
  @TransformResponseDTO(UserListResponseDto)
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User retrieved successfully',
    type: UserResponseDto
  })
  @TransformResponseDTO(UserResponseDto)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully',
    type: UserResponseDto
  })
  @TransformResponseDTO(UserResponseDto)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User deleted successfully',
    type: DeleteUserResponseDto
  })
  @TransformResponseDTO(DeleteUserResponseDto)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Test endpoint for admin' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  adminTest() {
    return { message: 'Users module is working correctly' };
  }
} 