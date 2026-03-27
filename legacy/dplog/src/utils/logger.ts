/**
 * [Role]   로깅 유틸리티 - Sentry 규칙 기반 구조화 로깅
 * [Input]  로그 레벨, 메시지, 데이터
 * [Output] Sentry logger를 활용한 구조화된 로그 출력
 * [NOTE]   Sentry logger · 구조화 로깅 · fmt 템플릿 지원
 */

import * as Sentry from '@sentry/nextjs';
import { ApiResponse } from '@/types/api';

export interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private sentryLogger = Sentry.logger;

  private toConsole(level: 'trace'|'debug'|'info'|'warn'|'error'|'fatal', message: string, payload?: LogContext) {
    if (typeof window !== 'undefined') {
      return;
    }
    try {
      const entry = {
        level,
        message,
        ...(payload ? { payload } : {}),
        ts: new Date().toISOString(),
      };
      const line = JSON.stringify(entry);
      if (level === 'error' || level === 'fatal') {
        // eslint-disable-next-line no-console
        console.error(line);
      } else if (level === 'warn') {
        // eslint-disable-next-line no-console
        console.warn(line);
      } else {
        // eslint-disable-next-line no-console
        console.log(line);
      }
    } catch {
      // eslint-disable-next-line no-console
      console.log(`[${level}] ${message}`, payload);
    }
  }

  trace(message: string, context?: LogContext): void {
    this.sentryLogger.trace(message, context);
    this.toConsole('trace', message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.sentryLogger.debug(message, context);
    this.toConsole('debug', message, context);
  }

  info(message: string, context?: LogContext, options?: { tags?: Record<string, string> }): void {
    if (options?.tags) {
      this.sentryLogger.info(message, { ...context, tags: options.tags });
    } else {
      this.sentryLogger.info(message, context);
    }
    this.toConsole('info', message, context ? (options?.tags ? { ...context, tags: options.tags } : context) : undefined);
  }

  warn(message: string, context?: LogContext, options?: { tags?: Record<string, string> }): void {
    if (options?.tags) {
      this.sentryLogger.warn(message, { ...context, tags: options.tags });
    } else {
      this.sentryLogger.warn(message, context);
    }
    this.toConsole('warn', message, context ? (options?.tags ? { ...context, tags: options.tags } : context) : undefined);
  }

  error(message: string, errorOrContext?: Error | LogContext, context?: LogContext): void {
    if (errorOrContext instanceof Error) {
      this.sentryLogger.error(message, { 
        ...context, 
        error: errorOrContext.message,
        stack: errorOrContext.stack 
      });
      this.toConsole('error', message, { ...(context || {}), error: errorOrContext.message, stack: errorOrContext.stack });
    } else {
      this.sentryLogger.error(message, errorOrContext);
      this.toConsole('error', message, errorOrContext);
    }
  }

  fatal(message: string, context?: LogContext): void {
    this.sentryLogger.fatal(message, context);
    this.toConsole('fatal', message, context);
  }

  fmt(strings: TemplateStringsArray, ...values: unknown[]): string {
    return this.sentryLogger.fmt(strings, ...values);
  }

  apiResponse<T = unknown>(operation: string, response: ApiResponse<T>, context?: LogContext): void {
    const isSuccess = response?.code === '0';
    const message = `API ${operation} ${isSuccess ? '성공' : '실패'}`;
    
    if (isSuccess) {
      this.info(message, { ...context, response: response.data });
    } else {
      this.error(message, { ...context, response });
    }
  }

  userAction(action: string, userId: string, context?: LogContext): void {
    this.info(`사용자 액션: ${action}`, { ...context, userId });
  }

  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`성능 측정: ${operation}`, { ...context, duration: `${duration}ms` });
  }
}

// 싱글톤 인스턴스
export const logger = new Logger();

// 편의 함수들
export const logTrace = (message: string, context?: LogContext) => 
  logger.trace(message, context);

export const logDebug = (message: string, context?: LogContext) => 
  logger.debug(message, context);

export const logInfo = (message: string, context?: LogContext, options?: { tags?: Record<string, string> }) => 
  logger.info(message, context, options);

export const logWarn = (message: string, context?: LogContext, options?: { tags?: Record<string, string> }) => 
  logger.warn(message, context, options);

export const logError = (message: string, errorOrContext?: Error | LogContext, context?: LogContext) => 
  logger.error(message, errorOrContext, context);

export const logFatal = (message: string, context?: LogContext) => 
  logger.fatal(message, context);

export const logApiResponse = <T = unknown>(operation: string, response: ApiResponse<T>, context?: LogContext) => 
  logger.apiResponse(operation, response, context);

export const logUserAction = (action: string, userId: string, context?: LogContext) => 
  logger.userAction(action, userId, context);

export const logPerformance = (operation: string, duration: number, context?: LogContext) => 
  logger.performance(operation, duration, context);
