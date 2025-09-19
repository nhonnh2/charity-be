import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { DatabaseService } from '@shared/services/database.service';
import { UtilsService } from '@shared/services/utils.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly databaseService: DatabaseService,
    private readonly utilsService: UtilsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();
    
    // Remove sensitive data from response
    return this.utilsService.removeSensitiveData(savedUser.toObject());
  }

  async findAll(queryDto: QueryUsersDto) {
    const { page, limit, search } = queryDto;
    
    let query = {};
    if (search) {
      query = this.databaseService.buildSearchQuery(search, ['name', 'email']);
    }

    return this.databaseService.getPaginatedResults(
      this.userModel,
      query,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return this.utilsService.removeSensitiveData(user.toObject());
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
      
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return this.utilsService.removeSensitiveData(updatedUser.toObject());
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
} 