# ChainGate
<div align="center">

**Secure Access Control with Blockchain & AI**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black.svg)](https://nextjs.org)
[![Django](https://img.shields.io/badge/Django-5.2.1-green.svg)](https://djangoproject.com)
[![Arduino](https://img.shields.io/badge/Arduino-ESP32-orange.svg)](https://arduino.cc)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Hardware Guide](#hardware-guide)

## Overview

ChainGate is a modern, blockchain-integrated access control system that combines NFC technology with distributed ledger security and AI-powered analytics. It provides real-time access management, user authentication, immutable audit trails through smart contract integration, and intelligent user behavior analysis through an integrated AI assistant that can answer natural language queries about user access patterns and history.

#### Key Features

- **NFC-Based Access Control**: Secure card-based authentication using PN532 readers
- **Blockchain Integration**: Immutable access logs stored on Ganache for development
- **AI-Powered User Analytics**: Intelligent assistant for analyzing user access patterns and history
- **Modern Web Dashboard**: Real-time monitoring and management interface
- **Modular Hardware**: ESP32-based device agents with expandable architecture
- **Real-Time Analytics**: Live blockchain status and transaction monitoring
- **RESTful API**: Comprehensive backend with Django REST Framework

## Architecture

ChainGate follows the architecture with the following components:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Access Portal │  │    Chain API    │  │  Device Agents  │
│   (Next.js)     │  │   (Django)      │  │   (ESP32S3)     │
│                 │  │                 │  │                 │
│ ▪ Web Dashboard │  │ ▪ REST API      │  │ ▪ NFC Reading   │
│ ▪ User Mgmt     │  │ ▪ Auth System   │  │ ▪ Access Control│
│ ▪ AI Assistant  │  │ ▪ Blockchain    │  │ ▪ LED Feedback  │
│ ▪ Real-time UI  │  │ ▪ Database      │  │ ▪ WiFi Comm     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                         ┌─────────────────┐
                         │   Blockchain    │
                         │   (Ganache)     │
                         │                 │
                         │ ▪ Smart Contract│
                         │ ▪ Access Logs   │
                         │ ▪ Audit Trail   │
                         └─────────────────┘
```

## Hardware Guide

### Overview
The hardware component of ChainGate combines ESP32-S3 microcontrollers with PN532 reader to create a secure physical access system. Each access point uses an ESP32-S3 board connected to a PN532 NFC module for card reading, with optional relay modules for electric lock control. The system is designed for low power consumption, reliable operation, and seamless integration with the blockchain backend for access verification and logging.

### Components

- **ESP32-S3 DevKit**: Main controller board with WiFi/BT capabilities
- **PN532 NFC Module**: For reading RFID/NFC cards and tokens
- **Power Supply**: 5V/2A USB power adapter
- **Jumper Wires**: For connecting components
- **Relay module**:  For electric lock control


For detailed assembly instructions and files, see the `/device-agent` directory.