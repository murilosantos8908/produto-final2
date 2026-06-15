create schema if not exists CorridaPro;
create database if not exists CorridaPro;
drop database if exists CorridaPro;
drop schema if exists CorridaPro;
use CorridaPro;

set @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
set @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
set @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

drop table if exists users;
create table if not exists users (
    id int primary key auto_increment,
    name varchar(255) not null,
    email varchar(255) not null,
    senha varchar(255)not null
)
engine = InnoDB;

drop table if exists corredores;
create table if not exists corredores (
    id int primary key auto_increment,
    nome varchar(255) not null,
    equipe varchar(255) not null
)
engine = InnoDB;

drop table if exists voltas;
create table if not exists voltas (
    id int primary key auto_increment,
    id_corredor int not null,
    tempo_segundos decimal(10, 3) not null,
    data_volta date not null
)
engine = InnoDB;

set SQL_MODE=@OLD_SQL_MODE;
set FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
set UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;