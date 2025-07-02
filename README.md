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
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Hardware Guide](#hardware-guide)
- [Development](#development)
- [Deployment](#deployment)
- [Screenshots & Demos](#screenshots--demos)
- [Support](#support)

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


## Project Structure

```
ChainGate/
├── README.md                   # Main project documentation
├── access-portal/              # Next.js frontend application
├── chain-api/                  # Django backend API
├── device-agents/              # Arduino firmware
├── database/                   # Database exports and schemas
├── deployment/                 # Docker and deployment configs
├── docs/                      # Project documentation
├── schematics/                # System diagrams
└── tests/                     # Test files and Postman collections
```