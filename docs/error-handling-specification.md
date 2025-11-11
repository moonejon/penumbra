# Error Handling UX Specification
## Import Page - Penumbra Library Management

---

## Table of Contents
1. [Overview](#overview)
2. [Error Message Hierarchy](#error-message-hierarchy)
3. [Error Scenarios & Solutions](#error-scenarios--solutions)
4. [UI Patterns & Components](#ui-patterns--components)
5. [Error Messaging Guidelines](#error-messaging-guidelines)
6. [Recovery Flows](#recovery-flows)
7. [Accessibility Requirements](#accessibility-requirements)
8. [Implementation Guidelines](#implementation-guidelines)

---

## Overview

### Design Principles
- **User-First Language**: Avoid technical jargon; speak in user terms
- **Actionable Guidance**: Every error should provide clear next steps
- **Progressive Disclosure**: Show essential info first, technical details on demand
- **Empathetic Tone**: Acknowledge frustration, provide reassurance
- **Prevention Over Recovery**: Guide users to avoid errors when possible

### Current State Analysis
**Existing Error Handling:**
- Queue component has basic error state with generic message
- No error handling in Search component
- No validation feedback for ISBN format
- Preview component has loading states but no error states
- Missing network error handling
- No timeout handling

---

## Error Message Hierarchy

### 1. Critical Errors (Blocking)
**Definition**: Prevents user from completing their task; requires immediate attention

**Visual Treatment**:
- Red color scheme (red-500/red-950 background)
- AlertCircle or XCircle icon
- Border: `border-red-500/50`
- Background: `bg-red-950/50`
- Text: `text-red-400`
- High visual prominence

**When to Use**:
- Network failures that prevent search/import
- API errors (404, 500, authentication)
- Database errors during import
- System-level failures

### 2. Warnings (Cautionary)
**Definition**: User can proceed but should be aware of potential issues

**Visual Treatment**:
- Amber/Orange color scheme
- AlertTriangle or Info icon
- Border: `border-amber-500/40` or `border-orange-500/40`
- Background: `bg-amber-950/40` or `bg-orange-950/40`
- Text: `text-amber-200` or `text-orange-200`
- Medium visual prominence

**When to Use**:
- Incomplete book data (already implemented)
- Duplicate detection (already implemented)
- Partial import success
- Data quality issues

### 3. Info Messages (Informational)
**Definition**: FYI messages that don't require action

**Visual Treatment**:
- Blue color scheme
- Info icon
- Border: `border-blue-500/40`
- Background: `bg-blue-950/40`
- Text: `text-blue-200`
- Low visual prominence

**When to Use**:
- Search tips
- Format guidance
- Success confirmations
- Process status updates

---

## Error Scenarios & Solutions

### 1. Search Errors

#### 1.1 Invalid ISBN Format
**Trigger**: User enters non-numeric characters or incorrect length

**Error State**:
```
Type: Warning (non-blocking)
Location: Inline below ISBN input field
Message: "Please enter a valid 10 or 13-digit ISBN number"
```

**UI Specifications**:
- Display inline validation message below input
- Border color changes to amber: `border-amber-500`
- Small text in `text-amber-400 text-sm`
- Icon: AlertCircle (size: 14px)
- Animate in with fade-in-down

**Recovery Flow**:
1. User sees immediate feedback as they type
2. Message disappears when valid format entered
3. Submit button remains enabled (allows users to try anyway)

**Prevention Strategy**:
- Input has `inputMode="numeric"` (already implemented)
- Add pattern validation with `pattern="[0-9]{10,13}"`
- Show example format: "e.g., 9780140449136"
- Real-time format validation with debounce (300ms)

#### 1.2 ISBN Not Found (404)
**Trigger**: Valid ISBN format but no results from API

**Error State**:
```
Type: Info (with action)
Location: Preview panel (replaces loading state)
Message: "We couldn't find a book with that ISBN"
Subtext: "Double-check the number or try the ISBN from the book's title page for better results."
```

**UI Specifications**:
```tsx
<Alert className="border-blue-500/40 bg-blue-950/40 text-blue-200">
  <BookX className="h-5 w-5 text-blue-400" />
  <AlertTitle className="text-blue-300 font-medium mb-2">
    Book Not Found
  </AlertTitle>
  <AlertDescription className="text-blue-200/90 text-sm leading-relaxed space-y-3">
    <p>We couldn't find a book matching ISBN: <code className="bg-blue-900/50 px-1.5 py-0.5 rounded text-blue-100">1234567890</code></p>
    <p>Try these steps:</p>
    <ul className="list-disc list-inside space-y-1 ml-2">
      <li>Check if the ISBN is correct</li>
      <li>Use the ISBN from the book's copyright page</li>
      <li>Try the other ISBN if both are listed (ISBN-10/ISBN-13)</li>
    </ul>
  </AlertDescription>
</Alert>
```

**Recovery Actions**:
- Clear button to reset search
- Input remains populated for easy editing
- Show last searched ISBN for reference

#### 1.3 Network/API Failure
**Trigger**: Network timeout, API down, connection lost

**Error State**:
```
Type: Critical
Location: Preview panel + Toast notification
Message: "Connection problem"
Subtext: "We couldn't reach the book database. Check your internet connection and try again."
```

**UI Specifications**:
```tsx
<Alert className="border-red-500/50 bg-red-950/50 text-red-400">
  <WifiOff className="h-5 w-5 text-red-400" />
  <AlertTitle className="text-red-300 font-medium mb-2">
    Connection Problem
  </AlertTitle>
  <AlertDescription className="text-red-200/90 text-sm leading-relaxed space-y-3">
    <p>We couldn't connect to the book database.</p>
    <div className="flex flex-col sm:flex-row gap-2 mt-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRetry}
        className="border-red-500/50 text-red-300 hover:bg-red-950/70"
      >
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        Retry Search
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="text-red-400 hover:text-red-300"
      >
        Dismiss
      </Button>
    </div>
  </AlertDescription>
</Alert>
```

**Recovery Flow**:
1. Show error immediately when fetch fails
2. Preserve the ISBN input value
3. Provide retry button with same search term
4. Track retry attempts (max 3 attempts)
5. After 3 failures, suggest checking connection + technical details option

**Technical Details Disclosure** (Progressive):
```tsx
<Collapsible>
  <CollapsibleTrigger className="text-xs text-red-400/60 hover:text-red-400 flex items-center gap-1 mt-2">
    <ChevronDown className="h-3 w-3" />
    Show technical details
  </CollapsibleTrigger>
  <CollapsibleContent className="mt-2 p-2 bg-red-900/20 rounded border border-red-500/30">
    <code className="text-xs text-red-300/80 font-mono">
      Error: Network request failed
      Status: 0
      Endpoint: https://api2.isbndb.com/book/{isbn}
    </code>
  </CollapsibleContent>
</Collapsible>
```

#### 1.4 Search Timeout
**Trigger**: API request takes longer than 15 seconds

**Error State**:
```
Type: Warning
Location: Preview panel
Message: "This is taking longer than expected"
Subtext: "The search is still running but might be experiencing issues."
```

**UI Specifications**:
- Show loading state for first 10 seconds
- At 10 seconds, transition to timeout warning
- Keep loading spinner but add warning alert above it
- Provide cancel + retry options
- Auto-cancel after 30 seconds

```tsx
<div className="space-y-4">
  {/* Timeout Warning */}
  <Alert className="border-amber-500/40 bg-amber-950/40 text-amber-200">
    <Clock className="h-4 w-4 text-amber-400" />
    <AlertTitle className="text-amber-300 font-medium mb-1">
      Still Searching...
    </AlertTitle>
    <AlertDescription className="text-amber-200/90 text-sm">
      This is taking longer than usual. The service might be slow.
      <div className="flex gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
        >
          Cancel Search
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleKeepWaiting}
        >
          Keep Waiting
        </Button>
      </div>
    </AlertDescription>
  </Alert>

  {/* Continue showing loading skeleton */}
  <LoadingSkeleton />
</div>
```

#### 1.5 API Authentication Error
**Trigger**: Missing or invalid API key (401, 403)

**Error State**:
```
Type: Critical
Location: Preview panel
Message: "Service configuration error"
Subtext: "There's a problem with the book search service. Please contact support."
```

**UI Specifications**:
```tsx
<Alert className="border-red-500/50 bg-red-950/50 text-red-400">
  <ShieldAlert className="h-5 w-5 text-red-400" />
  <AlertTitle className="text-red-300 font-medium mb-2">
    Service Configuration Error
  </AlertTitle>
  <AlertDescription className="text-red-200/90 text-sm leading-relaxed">
    <p>The book search service isn't properly configured.</p>
    <p className="mt-2 text-red-300/70 text-xs">
      Error Code: AUTH_FAILED
    </p>
  </AlertDescription>
</Alert>
```

**Recovery**: No user action available (system-level issue)

---

### 2. Import Errors

#### 2.1 Queue Submission Failure
**Trigger**: importBooks() returns success: false

**Error State**:
```
Type: Critical
Location: Queue panel (inline alert)
Message: "Couldn't add books to your library"
Subtext: "Something went wrong while saving. Your books are still in the queue."
```

**UI Specifications**:
```tsx
<Alert className="border-red-500/50 bg-red-950/50 text-red-400 mb-4">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle className="text-red-300 font-medium mb-2">
    Import Failed
  </AlertTitle>
  <AlertDescription className="text-red-200/90 text-sm leading-relaxed">
    <p>We couldn't add these books to your library.</p>
    <p className="mt-2">Your queue has been preserved. Try again in a moment.</p>
    <div className="flex gap-2 mt-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRetry}
        className="border-red-500/50 text-red-300 hover:bg-red-950/70"
      >
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        Retry Import
      </Button>
    </div>
  </AlertDescription>
</Alert>
```

**Recovery Flow**:
1. Preserve queue contents (DO NOT clear)
2. Show error with retry button
3. Log error details to console for debugging
4. Track retry attempts
5. After 3 failures, show different message:

```tsx
<AlertDescription>
  <p>We've tried several times but can't complete the import.</p>
  <p className="mt-2">This might be a temporary issue. Your queue is saved - you can try again later.</p>
  <Button variant="outline" size="sm" onClick={handleClearQueue} className="mt-3">
    Clear Queue and Start Over
  </Button>
</AlertDescription>
```

#### 2.2 Partial Import Success
**Trigger**: Some books import successfully, others fail

**Error State**:
```
Type: Warning
Location: Toast notification + Queue panel
Message: "Partially successful"
Subtext: "3 of 5 books were added. 2 books couldn't be imported."
```

**UI Specifications**:
```tsx
<Alert className="border-amber-500/40 bg-amber-950/40 text-amber-200">
  <AlertTriangle className="h-4 w-4 text-amber-400" />
  <AlertTitle className="text-amber-300 font-medium mb-2">
    Partial Import
  </AlertTitle>
  <AlertDescription className="text-amber-200/90 text-sm leading-relaxed">
    <p className="font-medium">3 of 5 books were added successfully</p>
    <p className="mt-2">2 books couldn't be imported:</p>
    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-amber-300/80">
      <li>Book Title One - Duplicate entry</li>
      <li>Book Title Two - Invalid data</li>
    </ul>
    <div className="flex gap-2 mt-3">
      <Button variant="outline" size="sm" onClick={handleRetryFailed}>
        Retry Failed Books
      </Button>
      <Button variant="ghost" size="sm" onClick={handleRemoveFailed}>
        Remove Failed from Queue
      </Button>
    </div>
  </AlertDescription>
</Alert>
```

**Recovery Flow**:
1. Successfully imported books are removed from queue
2. Failed books remain in queue with error indicators
3. Show inline error per failed book in queue
4. Provide options:
   - Retry just the failed books
   - Remove failed books from queue
   - Edit failed book data before retry

**Queue Item Error Indicator**:
```tsx
<div className="border-l-4 border-red-500">
  <Item
    title={book.title}
    authors={book.authors}
    error="Failed to import - Duplicate entry"
  />
</div>
```

#### 2.3 Database Error
**Trigger**: Prisma throws error during createMany

**Error State**:
```
Type: Critical
Location: Queue panel
Message: "Database error"
Subtext: "There was a problem saving to the database. Please try again."
```

**UI Specifications**:
```tsx
<Alert className="border-red-500/50 bg-red-950/50 text-red-400">
  <Database className="h-5 w-5 text-red-400" />
  <AlertTitle className="text-red-300 font-medium mb-2">
    Database Error
  </AlertTitle>
  <AlertDescription className="text-red-200/90 text-sm leading-relaxed">
    <p>We couldn't save your books due to a database problem.</p>
    <p className="mt-2">Your queue is preserved. Try again in a moment.</p>
    <Button
      variant="outline"
      size="sm"
      onClick={handleRetry}
      className="mt-3 border-red-500/50 text-red-300 hover:bg-red-950/70"
    >
      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
      Try Again
    </Button>
  </AlertDescription>
</Alert>
```

**Technical Details** (Collapsed):
```tsx
<Collapsible className="mt-2">
  <CollapsibleTrigger className="text-xs text-red-400/60 hover:text-red-400">
    Show error details
  </CollapsibleTrigger>
  <CollapsibleContent className="mt-2 p-2 bg-red-900/20 rounded text-xs">
    <code className="font-mono text-red-300/80">
      {error?.message || 'Unknown database error'}
    </code>
  </CollapsibleContent>
</Collapsible>
```

#### 2.4 Network Interruption During Import
**Trigger**: Network disconnects while import is processing

**Error State**:
```
Type: Critical
Location: Toast notification (persistent until dismissed)
Message: "Connection lost"
Subtext: "The import may not have completed. Check your library to see what was saved."
```

**UI Specifications**:
```tsx
{/* Persistent Toast - doesn't auto-dismiss */}
<Alert className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 border-red-500/50 bg-red-950/50 text-red-400 shadow-2xl max-w-md">
  <WifiOff className="h-4 w-4" />
  <AlertTitle className="text-red-300 font-medium mb-1">
    Connection Lost
  </AlertTitle>
  <AlertDescription className="text-red-200/90 text-sm">
    <p>Your connection was interrupted during import.</p>
    <div className="flex gap-2 mt-3">
      <Button
        variant="outline"
        size="sm"
        asChild
      >
        <Link href="/library">
          Check Library
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
      >
        Dismiss
      </Button>
    </div>
  </AlertDescription>
</Alert>
```

**Recovery Flow**:
1. Attempt to detect which books were successfully imported
2. Show link to library to verify import status
3. Preserve queue with status indicators:
   - Green checkmark: Confirmed imported
   - Gray question mark: Unknown status
   - Red X: Confirmed failed
4. Allow user to check duplicates before retrying

---

### 3. Data Errors

#### 3.1 Incomplete Book Data
**Status**: Already implemented
**Recommendation**: Enhance with more specific guidance

**Current Implementation**:
```tsx
<Alert className="border-amber-500/40 bg-amber-950/40 text-amber-200">
  <Info className="h-4 w-4 text-amber-400" />
  <AlertTitle>Incomplete Data</AlertTitle>
  <AlertDescription>
    Some book information is missing. Consider using the ISBN from the title page for more detailed results.
  </AlertDescription>
</Alert>
```

**Enhancement**:
```tsx
<Alert className="border-amber-500/40 bg-amber-950/40 text-amber-200">
  <Info className="h-4 w-4 text-amber-400" />
  <AlertTitle className="text-amber-300 font-medium mb-2">
    Incomplete Data Detected
  </AlertTitle>
  <AlertDescription className="text-amber-200/90 text-sm leading-relaxed">
    <p>This book is missing some information:</p>
    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
      {missingFields.map(field => (
        <li key={field}>{formatFieldName(field)}</li>
      ))}
    </ul>
    <p className="mt-3 text-amber-300/80">
      You can still add it, or try searching with the ISBN from the book's copyright page for better results.
    </p>
  </AlertDescription>
</Alert>
```

#### 3.2 Duplicate Detection
**Status**: Already implemented
**Recommendation**: Add more context and recovery options

**Current Implementation**:
```tsx
<Alert className="border-orange-500/40 bg-orange-950/40 text-orange-200">
  <Copy className="h-4 w-4 text-orange-400" />
  <AlertTitle>Duplicate Detected</AlertTitle>
  <AlertDescription>
    This book already exists in your library. Adding it again will create a duplicate copy.
  </AlertDescription>
</Alert>
```

**Enhancement**:
```tsx
<Alert className="border-orange-500/40 bg-orange-950/40 text-orange-200">
  <Copy className="h-4 w-4 text-orange-400" />
  <AlertTitle className="text-orange-300 font-medium mb-2">
    Already in Your Library
  </AlertTitle>
  <AlertDescription className="text-orange-200/90 text-sm leading-relaxed space-y-3">
    <p>This book already exists in your library.</p>
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        variant="outline"
        size="sm"
        asChild
        className="border-orange-500/50 text-orange-300"
      >
        <Link href={`/library?search=${book.isbn13}`}>
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
          View in Library
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-orange-400"
      >
        Add Anyway (duplicate copy)
      </Button>
    </div>
  </AlertDescription>
</Alert>
```

#### 3.3 Missing Cover Image
**Status**: Already handled with placeholder
**Recommendation**: Keep current implementation

Current placeholder pattern is appropriate:
```tsx
<div className="flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-850 rounded-lg">
  <ImageIcon className="w-12 h-12 text-zinc-600" />
</div>
```

---

## UI Patterns & Components

### Component Architecture

#### 1. Error Alert Component
**Purpose**: Reusable alert component for different error types

```tsx
// /src/components/ui/error-alert.tsx

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type ErrorSeverity = 'critical' | 'warning' | 'info';

interface ErrorAlertProps {
  severity: ErrorSeverity;
  title: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    border: 'border-red-500/50',
    bg: 'bg-red-950/50',
    text: 'text-red-400',
    titleText: 'text-red-300',
    iconColor: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-500/40',
    bg: 'bg-amber-950/40',
    text: 'text-amber-200',
    titleText: 'text-amber-300',
    iconColor: 'text-amber-400',
  },
  info: {
    icon: Info,
    border: 'border-blue-500/40',
    bg: 'bg-blue-950/40',
    text: 'text-blue-200',
    titleText: 'text-blue-300',
    iconColor: 'text-blue-400',
  },
};

export function ErrorAlert({
  severity,
  title,
  message,
  details,
  onRetry,
  onDismiss,
  actions,
  className,
}: ErrorAlertProps) {
  const [showDetails, setShowDetails] = useState(false);
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Alert className={cn(config.border, config.bg, config.text, className)}>
      <Icon className={cn('h-5 w-5', config.iconColor)} />
      <AlertTitle className={cn(config.titleText, 'font-medium mb-2')}>
        {title}
      </AlertTitle>
      <AlertDescription className={cn(config.text, 'text-sm leading-relaxed space-y-3')}>
        <p>{message}</p>

        {/* Actions */}
        {(onRetry || onDismiss || actions) && (
          <div className="flex flex-col sm:flex-row gap-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className={cn(
                  severity === 'critical' && 'border-red-500/50 text-red-300 hover:bg-red-950/70',
                  severity === 'warning' && 'border-amber-500/50 text-amber-300 hover:bg-amber-950/70'
                )}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
              >
                Dismiss
              </Button>
            )}
            {actions}
          </div>
        )}

        {/* Technical Details (Collapsible) */}
        {details && (
          <div className="mt-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity"
            >
              <ChevronDown
                className={cn(
                  'h-3 w-3 transition-transform',
                  showDetails && 'rotate-180'
                )}
              />
              {showDetails ? 'Hide' : 'Show'} technical details
            </button>
            {showDetails && (
              <div className="mt-2 p-2 bg-black/20 rounded border border-current/30">
                <code className="text-xs font-mono opacity-80 block whitespace-pre-wrap break-all">
                  {details}
                </code>
              </div>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

#### 2. Toast Notification System
**Purpose**: Non-blocking notifications for status updates

```tsx
// /src/components/ui/toast-notification.tsx

import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number; // milliseconds, 0 for persistent
  onDismiss?: () => void;
  show: boolean;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    border: 'border-green-500/50',
    bg: 'bg-green-950/50',
    text: 'text-green-400',
  },
  error: {
    icon: AlertCircle,
    border: 'border-red-500/50',
    bg: 'bg-red-950/50',
    text: 'text-red-400',
  },
  info: {
    icon: Info,
    border: 'border-blue-500/50',
    bg: 'bg-blue-950/50',
    text: 'text-blue-400',
  },
};

export function ToastNotification({
  type,
  message,
  duration = 4000,
  onDismiss,
  show,
}: ToastProps) {
  const [visible, setVisible] = useState(show);
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    setVisible(show);

    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      className={cn(
        'fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 max-w-md w-full mx-4',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <Alert className={cn(config.border, config.bg, config.text, 'shadow-2xl')}>
        <Icon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          <button
            onClick={handleDismiss}
            className="ml-4 hover:opacity-70 transition-opacity"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

#### 3. Inline Validation Component
**Purpose**: Real-time form validation feedback

```tsx
// /src/components/ui/inline-validation.tsx

import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineValidationProps {
  message: string;
  type: 'error' | 'success' | 'hint';
  show: boolean;
  className?: string;
}

export function InlineValidation({
  message,
  type,
  show,
  className,
}: InlineValidationProps) {
  if (!show) return null;

  const config = {
    error: {
      icon: AlertCircle,
      text: 'text-amber-400',
    },
    success: {
      icon: CheckCircle,
      text: 'text-green-400',
    },
    hint: {
      icon: null,
      text: 'text-zinc-500',
    },
  };

  const { icon: Icon, text } = config[type];

  return (
    <div
      className={cn(
        'flex items-start gap-2 text-sm mt-1.5 animate-in fade-in-50 slide-in-from-top-1',
        text,
        className
      )}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {Icon && <Icon className="h-4 w-4 mt-0.5 shrink-0" />}
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
```

#### 4. Empty State Component
**Purpose**: Guide users when no results or errors occur

```tsx
// /src/components/ui/empty-state.tsx

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className
      )}
    >
      <div className="relative mb-4">
        <Icon className="w-16 h-16 text-zinc-700" />
        <div className="absolute inset-0 bg-zinc-700/20 blur-2xl" />
      </div>
      <h3 className="text-zinc-300 font-medium mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm max-w-sm mb-6">{description}</p>
      {action && (
        <Button
          variant="outline"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

### Layout Patterns

#### Error Placement Guidelines

**1. Inline Errors** (Input validation)
- Position: Directly below the input field
- Margin: `mt-1.5` (6px)
- Width: Match input width
- Animation: Fade in from top

**2. Section Errors** (Component-level)
- Position: Top of affected section
- Margin: `mb-4` (16px) from content
- Width: Full section width
- Animation: Fade in

**3. Toast Notifications** (Global status)
- Position: Bottom center, `bottom-8`
- Z-index: 50
- Max-width: `max-w-md`
- Animation: Slide up + fade in

**4. Modal Errors** (Blocking critical errors)
- Position: Center screen overlay
- Backdrop: Semi-transparent black
- Z-index: 100
- Animation: Scale + fade in

---

## Error Messaging Guidelines

### Voice & Tone

**Core Principles**:
1. **Be Human**: Write like you're helping a friend
2. **Be Specific**: "ISBN not found" not "Error occurred"
3. **Be Helpful**: Always provide next steps
4. **Be Honest**: Don't hide or sugarcoat problems
5. **Be Brief**: Front-load the most important info

### Writing Patterns

#### Error Title Format
```
Pattern: [What happened] - clear, specific, < 5 words
Good: "Book Not Found"
Good: "Connection Problem"
Bad: "Error"
Bad: "An unexpected error has occurred"
```

#### Error Message Format
```
Pattern:
1. What happened (1 sentence)
2. Why it might have happened (1 sentence, optional)
3. What to do next (specific action)

Example:
"We couldn't find a book with that ISBN. The ISBN might be incorrect or not in our database. Try checking the number or using the ISBN from the book's title page."
```

#### Action Button Labels
```
Pattern: Verb + Object (specific action)
Good: "Retry Search"
Good: "Check Library"
Good: "Clear Queue"
Bad: "OK"
Bad: "Continue"
Bad: "Retry"
```

### Message Templates

#### Network Errors
```
Title: "Connection Problem"
Message: "We couldn't connect to [service]. Check your internet connection and try again."
Action: "Retry [Action]"
```

#### Not Found Errors
```
Title: "[Item] Not Found"
Message: "We couldn't find a [item] matching [query]. [Specific suggestion]."
Action: "Try Again" or "Learn More"
```

#### Validation Errors
```
Title: (None - inline only)
Message: "Please [specific requirement]"
Example: "Please enter a 10 or 13-digit ISBN number"
```

#### System Errors
```
Title: "[Component] Error"
Message: "There was a problem with [component]. [Reassurance about data]. Try again in a moment."
Action: "Retry" or "Contact Support"
```

### Localization Considerations

**Prepare for future localization**:
- Keep messages in separate constants/files
- Avoid concatenating strings
- Use placeholders for dynamic content
- Keep error codes separate from messages

```tsx
// error-messages.ts
export const ERROR_MESSAGES = {
  ISBN_NOT_FOUND: {
    title: 'Book Not Found',
    message: (isbn: string) => `We couldn't find a book with ISBN: ${isbn}`,
    code: 'ERR_ISBN_404',
  },
  NETWORK_ERROR: {
    title: 'Connection Problem',
    message: 'We couldn't reach the book database. Check your internet connection and try again.',
    code: 'ERR_NETWORK',
  },
};
```

---

## Recovery Flows

### Flow Diagrams

#### 1. Search Error Recovery

```
┌─────────────────────────────────────────────────┐
│ User submits ISBN search                        │
└─────────────┬───────────────────────────────────┘
              │
              ▼
         ┌────────┐
         │Validate│
         │ Format │
         └────┬───┘
              │
         ┌────┴────┐
    Invalid│   │Valid
         ▼    │    ▼
    ┌─────────┐  ┌──────────┐
    │ Show    │  │  Send    │
    │ Inline  │  │  API     │
    │ Error   │  │ Request  │
    └────┬────┘  └────┬─────┘
         │            │
         │       ┌────┴─────────────┐
         │       │                  │
         │    Success            Error
         │       │              ┌───┴────┐
         │       ▼              │        │
         │  ┌─────────┐    Network   404
         │  │ Display │         │        │
         │  │ Preview │         ▼        ▼
         │  └─────────┘   ┌─────────┬────────┐
         │               │ Critical│  Info  │
         │               │  Alert  │ Alert  │
         │               └────┬────┴───┬────┘
         │                    │        │
         │                    ▼        ▼
         │               ┌─────────┬────────────┐
         │               │  Retry  │ Edit ISBN  │
         │               │ Button  │   Input    │
         │               └────┬────┴─────┬──────┘
         │                    │          │
         │                    └────┬─────┘
         └─────────────────────────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │ User can retry │
                          │  or continue   │
                          └────────────────┘
```

#### 2. Import Error Recovery

```
┌──────────────────────────────────────────────┐
│ User clicks "Add to Library"                 │
└──────────┬───────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Show Loading │
    │   (Spinner)  │
    └──────┬───────┘
           │
      ┌────┴────────────────┐
      │                     │
   Success               Failure
      │                ┌────┴─────────────────┐
      ▼                │                      │
┌──────────┐      Network              Database
│  Clear   │       Error                 Error
│  Queue   │          │                      │
└────┬─────┘          ▼                      ▼
     │         ┌──────────────┐      ┌──────────────┐
     ▼         │  Preserve    │      │  Preserve    │
┌──────────┐  │   Queue      │      │   Queue      │
│  Show    │  └──────┬───────┘      └──────┬───────┘
│ Success  │         │                     │
│  Toast   │         ▼                     ▼
└──────────┘  ┌──────────────┐      ┌──────────────┐
              │ Show Error   │      │ Show Error   │
              │ + Retry Btn  │      │ + Retry Btn  │
              └──────┬───────┘      └──────┬───────┘
                     │                     │
                ┌────┴─────────────────────┘
                │
                ▼
         ┌──────────────┐
         │ Track Retry  │
         │  Attempts    │
         └──────┬───────┘
                │
           ┌────┴────┐
      < 3  │         │ ≥ 3
           ▼         ▼
     ┌─────────┬──────────────┐
     │ Allow   │  Show        │
     │ Retry   │  "Give Up"   │
     │         │   Option     │
     └─────────┴──────────────┘
```

#### 3. Validation Error Recovery

```
┌────────────────────────────────┐
│ User types in ISBN field       │
└────────┬───────────────────────┘
         │
         ▼
    ┌────────────┐
    │  Debounce  │
    │  (300ms)   │
    └─────┬──────┘
          │
          ▼
    ┌─────────────┐
    │  Validate   │
    │   Format    │
    └──────┬──────┘
           │
      ┌────┴────┐
  Valid│    │Invalid
       │    │
       ▼    ▼
   ┌────┬──────┐
   │Hide│ Show │
   │Err │Inline│
   │    │Error │
   └─┬──┴──┬───┘
     │     │
     ▼     ▼
 ┌────────────────────┐
 │ User sees feedback │
 │   immediately      │
 └─────────┬──────────┘
           │
           ▼
      ┌─────────┐
      │ User can│
      │continue │
      │ typing  │
      └─────────┘
```

### Recovery Action Priority

**For each error type, provide actions in this order:**

1. **Primary Action** (Most common fix)
   - Always visible
   - Prominent button style
   - Keyboard shortcut if applicable

2. **Secondary Action** (Alternative approach)
   - Visible but less prominent
   - Ghost or outline button style

3. **Tertiary Action** (Learn more / Contact support)
   - Link style or subtle button
   - May be collapsed initially

**Example**:
```tsx
{/* Network Error Actions */}
<div className="flex flex-col sm:flex-row gap-2">
  {/* Primary */}
  <Button variant="outline" onClick={handleRetry}>
    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
    Retry Search
  </Button>

  {/* Secondary */}
  <Button variant="ghost" onClick={handleCancel}>
    Cancel
  </Button>

  {/* Tertiary */}
  <Button variant="link" asChild>
    <Link href="/help/connection-issues">
      Learn more
    </Link>
  </Button>
</div>
```

### Retry Logic Specifications

#### Exponential Backoff
```typescript
// utils/retry-logic.ts

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number; // milliseconds
  maxDelay: number;
  factor: number; // exponential factor
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  factor: 2,
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  onRetry?: (attempt: number, delay: number) => void
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < config.maxAttempts - 1) {
        const delay = Math.min(
          config.initialDelay * Math.pow(config.factor, attempt),
          config.maxDelay
        );

        onRetry?.(attempt + 1, delay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// Usage in Search component:
const handleSearch = async (isbn: string) => {
  setLoading(true);
  setError(null);

  try {
    await retryWithBackoff(
      () => fetchMetadata(isbn),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 5000,
        factor: 2,
      },
      (attempt, delay) => {
        // Show retry feedback to user
        console.log(`Retry attempt ${attempt}, waiting ${delay}ms`);
      }
    );
  } catch (error) {
    setError({
      type: 'critical',
      message: 'Connection failed after multiple attempts',
      details: error.message,
    });
  } finally {
    setLoading(false);
  }
};
```

#### Retry Attempt Tracking
```typescript
// Track user-initiated retries (different from automatic retries)

interface RetryState {
  count: number;
  lastAttempt: Date | null;
}

const [retryState, setRetryState] = useState<RetryState>({
  count: 0,
  lastAttempt: null,
});

const handleManualRetry = () => {
  const newCount = retryState.count + 1;

  setRetryState({
    count: newCount,
    lastAttempt: new Date(),
  });

  // Show escalated message after 3 attempts
  if (newCount >= 3) {
    setError({
      type: 'critical',
      message: 'Still having trouble? The service might be temporarily unavailable.',
      actions: (
        <>
          <Button variant="outline" onClick={handleClearAndReset}>
            Start Over
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/help">Contact Support</Link>
          </Button>
        </>
      ),
    });
  }

  // Attempt the action again
  performSearch();
};
```

---

## Accessibility Requirements

### ARIA Attributes

#### Error Alerts
```tsx
<Alert
  role="alert"
  aria-live="assertive"  // For critical errors
  aria-atomic="true"
  className="..."
>
  {/* ... */}
</Alert>

<Alert
  role="status"
  aria-live="polite"  // For warnings/info
  aria-atomic="true"
  className="..."
>
  {/* ... */}
</Alert>
```

#### Form Validation
```tsx
<div>
  <input
    id="isbn-input"
    type="text"
    aria-invalid={hasError}
    aria-describedby={hasError ? "isbn-error" : undefined}
    aria-required="true"
  />
  {hasError && (
    <div
      id="isbn-error"
      role="alert"
      aria-live="polite"
    >
      {errorMessage}
    </div>
  )}
</div>
```

#### Loading States
```tsx
<div
  role="status"
  aria-live="polite"
  aria-busy={loading}
  aria-label={loading ? "Searching for book" : undefined}
>
  {loading ? <Skeleton /> : <BookPreview />}
</div>
```

### Screen Reader Announcements

#### Dynamic Announcements
```tsx
// Announce search results to screen readers
import { useAnnouncer } from '@/hooks/useAnnouncer';

const { announce } = useAnnouncer();

// After search completes:
announce('Book found: [Title] by [Author]', 'polite');

// After error:
announce('Error: Could not find book with that ISBN', 'assertive');

// After import success:
announce('Successfully added 3 books to your library', 'polite');
```

#### Screen Reader Only Text
```tsx
// Provide context for icon-only buttons
<button
  onClick={handleRetry}
  aria-label="Retry search for this ISBN"
>
  <RefreshCw className="h-4 w-4" />
  <span className="sr-only">Retry</span>
</button>
```

### Keyboard Navigation

#### Focus Management

**Error Dialog Focus**:
```tsx
import { useEffect, useRef } from 'react';

function ErrorDialog({ show, onClose }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (show && closeButtonRef.current) {
      // Focus the close button when error appears
      closeButtonRef.current.focus();
    }
  }, [show]);

  return (
    <Alert>
      {/* Error content */}
      <Button
        ref={closeButtonRef}
        onClick={onClose}
      >
        Close
      </Button>
    </Alert>
  );
}
```

**Focus Trap for Modal Errors**:
```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

function CriticalErrorModal({ show, onClose }) {
  const modalRef = useFocusTrap<HTMLDivElement>(show);

  return (
    <div
      ref={modalRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="error-title"
      aria-describedby="error-description"
    >
      {/* Modal content */}
    </div>
  );
}
```

#### Keyboard Shortcuts

```tsx
// ESC to dismiss non-critical errors
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && error && !error.critical) {
      handleDismissError();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [error]);

// Enter to retry
<Button
  onClick={handleRetry}
  autoFocus  // Focus on mount
>
  Retry
</Button>
```

### Visual Accessibility

#### Color Contrast Requirements

All error states must meet WCAG 2.1 AA standards:

**Text Contrast**:
- Normal text (< 18px): 4.5:1 minimum
- Large text (≥ 18px): 3:1 minimum

**Current Implementation Check**:
```
Critical Error:
- Background: rgb(69, 10, 10) // #450a0a (red-950)
- Text: rgb(252, 165, 165) // #fca5a5 (red-400)
- Ratio: ~8.5:1 ✓ PASS

Warning:
- Background: rgb(69, 26, 3) // #451a03 (amber-950)
- Text: rgb(253, 230, 138) // #fde68a (amber-200)
- Ratio: ~10:1 ✓ PASS

Info:
- Background: rgb(23, 37, 84) // #172554 (blue-950)
- Text: rgb(191, 219, 254) // #bfdbfe (blue-200)
- Ratio: ~9:1 ✓ PASS
```

#### Icon + Text Pairing

Never rely on color alone:
```tsx
// Good: Icon + color + text
<Alert className="border-red-500/50 bg-red-950/50 text-red-400">
  <AlertCircle className="h-5 w-5" />
  <AlertTitle>Error: Connection Failed</AlertTitle>
  {/* ... */}
</Alert>

// Bad: Color only
<Alert className="border-red-500/50 bg-red-950/50 text-red-400">
  <AlertTitle>Connection Failed</AlertTitle>  {/* No icon */}
  {/* ... */}
</Alert>
```

#### Focus Indicators

Ensure visible focus states on all interactive elements:
```tsx
<Button
  className={cn(
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-zinc-400',
    // ... other classes
  )}
>
  Retry
</Button>
```

### Reduced Motion Support

```tsx
// Respect prefers-reduced-motion
<Alert
  className={cn(
    'transition-all',
    'duration-300',
    'motion-reduce:transition-none', // Disable animations
    // ... other classes
  )}
>
  {/* ... */}
</Alert>

// Toast animations
<div
  className={cn(
    'transition-all duration-300',
    'motion-reduce:transition-none',
    show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
  )}
>
  <Toast />
</div>
```

---

## Implementation Guidelines

### Phase 1: Search Component Enhancements

**Files to Modify**:
- `/src/app/import/components/search.tsx`

**Changes**:

1. Add error state management:
```tsx
const [error, setError] = useState<{
  type: 'validation' | 'network' | 'notfound' | 'api';
  message: string;
  details?: string;
} | null>(null);
```

2. Add ISBN format validation:
```tsx
const validateISBN = (isbn: string): boolean => {
  const cleaned = isbn.replace(/[-\s]/g, '');
  return /^[0-9]{10,13}$/.test(cleaned);
};
```

3. Wrap fetchMetadata with error handling:
```tsx
const onSubmit: SubmitHandler<Inputs> = async (data) => {
  setLoading(true);
  setError(null);

  // Validate format
  if (!validateISBN(data.isbn)) {
    setError({
      type: 'validation',
      message: 'Please enter a valid 10 or 13-digit ISBN number',
    });
    setLoading(false);
    return;
  }

  try {
    const value = await fetchMetadata(data.isbn);
    const { book } = value;

    if (!book) {
      setError({
        type: 'notfound',
        message: `We couldn't find a book with ISBN: ${data.isbn}`,
      });
      setLoading(false);
      return;
    }

    // ... existing book data processing

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        setError({
          type: 'api',
          message: 'Service configuration error',
          details: error.message,
        });
      } else {
        setError({
          type: 'network',
          message: 'Connection problem. Check your internet and try again.',
          details: error.message,
        });
      }
    }
  } finally {
    setLoading(false);
  }
};
```

4. Add inline validation display:
```tsx
return (
  <div className="...">
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="isbn"
        control={control}
        rules={{
          required: true,
          validate: validateISBN,
        }}
        render={({ field, fieldState }) => (
          <>
            <input
              {...field}
              aria-invalid={!!fieldState.error || !!error}
              aria-describedby={error ? "isbn-error" : undefined}
              className={cn(
                'w-full px-4 py-2.5 ...',
                (fieldState.error || error?.type === 'validation') && 'border-amber-500'
              )}
            />
            {error?.type === 'validation' && (
              <InlineValidation
                type="error"
                message={error.message}
                show={true}
              />
            )}
          </>
        )}
      />
      {/* ... submit button */}
    </form>
  </div>
);
```

### Phase 2: Preview Component Error States

**Files to Modify**:
- `/src/app/import/components/preview.tsx`

**Changes**:

1. Add error state props:
```tsx
interface BookProps {
  book: BookImportDataType;
  setBookData: Dispatch<SetStateAction<BookImportDataType>>;
  loading: boolean;
  error: ErrorState | null;  // NEW
  onRetry?: () => void;       // NEW
  importQueue: BookImportDataType[];
  setImportQueue: Dispatch<SetStateAction<BookImportDataType[]>>;
}
```

2. Add error display states:
```tsx
const showEmpty = book === initialBookImportData && !loading && !error;
const showLoading = loading && !error;
const showError = !!error;
const showContent = book !== initialBookImportData && !loading && !error;
```

3. Add error rendering:
```tsx
{showError && error && (
  <ErrorAlert
    severity={error.type === 'network' || error.type === 'api' ? 'critical' : 'info'}
    title={getErrorTitle(error.type)}
    message={error.message}
    details={error.details}
    onRetry={onRetry}
    onDismiss={() => setError(null)}
  />
)}
```

### Phase 3: Queue Component Error Handling

**Files to Modify**:
- `/src/app/import/components/queue.tsx`

**Changes**:

1. Enhanced error state:
```tsx
const [error, setError] = useState<{
  type: 'import' | 'network' | 'partial';
  message: string;
  failedBooks?: Array<{ index: number; title: string; reason: string }>;
} | null>(null);
```

2. Improved import error handling:
```tsx
const handleSubmit = async () => {
  setIsImporting(true);
  setError(null);

  try {
    const cleanedBooks = books.map(/* ... */);
    const result = await importBooks(cleanedBooks);

    if (result?.success) {
      setBooks([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } else {
      setError({
        type: 'import',
        message: 'We couldn\'t add these books to your library. Try again in a moment.',
      });
    }
  } catch (err) {
    const isNetworkError = err instanceof TypeError && err.message.includes('fetch');

    setError({
      type: isNetworkError ? 'network' : 'import',
      message: isNetworkError
        ? 'Connection lost during import. Check your library to see what was saved.'
        : 'An unexpected error occurred. Your queue has been preserved.',
    });

    console.error('Import error:', err);
  } finally {
    setIsImporting(false);
  }
};
```

3. Add retry logic:
```tsx
const [retryCount, setRetryCount] = useState(0);

const handleRetry = () => {
  setRetryCount(prev => prev + 1);
  handleSubmit();
};

// Show different message after 3 retries
const retryMessage = retryCount >= 3
  ? "We've tried several times but can't complete the import."
  : "We couldn't add these books to your library.";
```

### Phase 4: Create Reusable Error Components

**Files to Create**:
- `/src/components/ui/error-alert.tsx` (see UI Patterns section)
- `/src/components/ui/toast-notification.tsx` (see UI Patterns section)
- `/src/components/ui/inline-validation.tsx` (see UI Patterns section)
- `/src/utils/error-handling.ts` (utility functions)

**Utility Functions**:
```typescript
// /src/utils/error-handling.ts

export type ErrorType =
  | 'validation'
  | 'network'
  | 'notfound'
  | 'api'
  | 'database'
  | 'timeout';

export interface ErrorState {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
}

export function getErrorTitle(type: ErrorType): string {
  const titles: Record<ErrorType, string> = {
    validation: 'Invalid Input',
    network: 'Connection Problem',
    notfound: 'Not Found',
    api: 'Service Error',
    database: 'Database Error',
    timeout: 'Request Timeout',
  };
  return titles[type];
}

export function getSeverity(type: ErrorType): 'critical' | 'warning' | 'info' {
  const critical: ErrorType[] = ['network', 'api', 'database'];
  const warning: ErrorType[] = ['validation', 'timeout'];

  if (critical.includes(type)) return 'critical';
  if (warning.includes(type)) return 'warning';
  return 'info';
}

export function isRetryable(type: ErrorType): boolean {
  return ['network', 'timeout', 'api'].includes(type);
}

export function parseApiError(error: unknown): ErrorState {
  if (error instanceof Response) {
    if (error.status === 404) {
      return {
        type: 'notfound',
        message: 'The requested resource was not found',
        code: 'ERR_404',
      };
    }
    if (error.status === 401 || error.status === 403) {
      return {
        type: 'api',
        message: 'Service configuration error',
        code: `ERR_${error.status}`,
      };
    }
    if (error.status >= 500) {
      return {
        type: 'api',
        message: 'The service is temporarily unavailable',
        code: `ERR_${error.status}`,
      };
    }
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Connection problem. Check your internet and try again.',
      code: 'ERR_NETWORK',
    };
  }

  return {
    type: 'api',
    message: 'An unexpected error occurred',
    details: error instanceof Error ? error.message : String(error),
    code: 'ERR_UNKNOWN',
  };
}
```

### Phase 5: Testing & Validation

**Create Error Simulation Tool** (Development only):
```tsx
// /src/app/import/components/error-simulator.tsx
// Only rendered in development environment

'use client';

import { useState } from 'react';

export function ErrorSimulator({ onSimulate }: { onSimulate: (type: string) => void }) {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700 z-50">
      <p className="text-xs text-zinc-400 mb-2">Error Simulator (Dev Only)</p>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onSimulate('network')}
          className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          Network Error
        </button>
        <button
          onClick={() => onSimulate('notfound')}
          className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          404 Not Found
        </button>
        <button
          onClick={() => onSimulate('timeout')}
          className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          Timeout
        </button>
        <button
          onClick={() => onSimulate('partial')}
          className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          Partial Import
        </button>
      </div>
    </div>
  );
}
```

**Testing Checklist**:
- [ ] Keyboard navigation through all error states
- [ ] Screen reader announces errors properly
- [ ] Color contrast meets WCAG AA
- [ ] Focus management works correctly
- [ ] Retry logic doesn't create infinite loops
- [ ] Error messages are clear and actionable
- [ ] Technical details can be accessed when needed
- [ ] Reduced motion preferences respected
- [ ] Toast notifications don't overlap
- [ ] Error states clear when appropriate

---

## Summary

### Key Deliverables

1. **Error Message Hierarchy**
   - Critical, Warning, and Info levels defined
   - Clear visual differentiation
   - Appropriate placement strategies

2. **UI Components**
   - ErrorAlert (reusable alert component)
   - ToastNotification (status notifications)
   - InlineValidation (form feedback)
   - EmptyState (guidance component)

3. **Error Scenarios Covered**
   - Search errors (invalid format, not found, network, API, timeout)
   - Import errors (queue failure, partial success, database, network interruption)
   - Data errors (incomplete data, duplicates, missing images)

4. **Recovery Flows**
   - Clear retry mechanisms
   - Exponential backoff strategy
   - Retry attempt tracking
   - Escalation paths

5. **Accessibility**
   - ARIA attributes specified
   - Screen reader support
   - Keyboard navigation
   - Focus management
   - Color contrast compliance
   - Reduced motion support

6. **Implementation Guidance**
   - 5-phase implementation plan
   - Code examples for all components
   - Utility functions for error handling
   - Testing tools and checklist

### Next Steps

1. Review this specification with the development team
2. Implement Phase 1 (Search component enhancements)
3. Create reusable error components (Phase 4)
4. Implement remaining phases (Preview, Queue)
5. Test all error scenarios thoroughly
6. Validate accessibility compliance
7. Gather user feedback on error messaging

### Maintenance

- Review error messages quarterly for clarity
- Monitor error rates in analytics
- Update based on user feedback
- Keep error codes documented
- Maintain error message constants for future localization
