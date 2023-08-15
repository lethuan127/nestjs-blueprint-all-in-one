import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { name: 'client_id', length: 50, nullable: false })
  clientId: string;

  @Column('varchar', { name: 'user_id', nullable: false })
  userId: string;

  @Column('varchar', { name: 'job_name', nullable: false })
  name: string;

  @CreateDateColumn({ name: 'created_at' }) created_at: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updated_at: Date;
}
