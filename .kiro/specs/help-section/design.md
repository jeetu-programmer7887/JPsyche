# Help Section Design Document

## Overview

The Help Section feature will provide users with comprehensive guidance on using the JPsyche application. Unlike the existing static pages (Privacy, Terms, Crisis), the Help Section will be integrated into the main application interface, displaying within the chat area when accessed from the sidebar. This design maintains consistency with the application's existing patterns while providing an intuitive, accessible help experience.

## Architecture

### Component Structure

The Help Section will follow a hybrid approach:

1. **In-App Help View**: A special state within the main page component that displays help content in the chat area
2. **Conditional Rendering**: The help content replaces the chat interface when the help section is active
3. **State Management**: Uses existing React state patterns to track when help is displayed

### Integration Points

- **Sidebar Component**: Already has a Help button that calls `onSelectChat("help")`
- **Main Page Component** (`src/app/page.tsx`): Will be modified to detect the "help" ID and render help content
- **Routing**: No new routes needed; help is a special view state within the main page

## Components and Interfaces

### 1. Help Content Component

**Location**: `src/components/help-content.tsx`

**Purpose**: Renders the help section content with proper styling and structure

**Props Interface**:
```typescript
interface HelpContentProps {
  onClose?: () => void; // Optional callback to return to chat
}
```

**Key Features**:
- Responsive layout matching the application's design system
- Sections for: Introduction, Features, Usage Guidelines, Account Info, Privacy & Safety
- Uses Lucide React icons for visual enhancement
- Framer Motion animations for smooth transitions
- Links to related pages (Privacy, Terms, Crisis)

### 2. Modified Main Page Component

**Location**: `src/app/page.tsx`

**Changes Required**:
- Add state to track if help section is active
- Modify `handleSelectChat` to detect "help" ID
- Conditionally render `HelpContent` component instead of chat interface
- Hide chat input area when help is displayed
- Update sidebar active state to highlight Help button

### 3. Modified Sidebar Component

**Location**: `src/components/sidebar.tsx`

**Changes Required**:
- Update `activeChatId` prop type to accept `"help"` as a valid value
- Visual indication when Help is active (similar to active chat styling)

## Data Models

No new data models are required. The help section uses:

- **Static Content**: Help text and structure defined in the component
- **Existing State**: Leverages the `activeChatId` state to track help view
- **No Persistence**: Help content is not stored in the database

## User Interface Design

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Header (unchanged)                                   │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ Help Section Header                          │   │
│  │ - Icon + Title                               │   │
│  │ - Brief description                          │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ Section 1: Getting Started                   │   │
│  │ - Introduction to JPsyche                    │   │
│  │ - How to start a conversation                │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ Section 2: Features                          │   │
│  │ - Chat functionality                         │   │
│  │ - Message editing                            │   │
│  │ - Text-to-speech                             │   │
│  │ - Chat management                            │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ Section 3: Account & Privacy                 │   │
│  │ - Guest vs authenticated features            │   │
│  │ - Data privacy information                   │   │
│  │ - Links to policies                          │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ Section 4: Support & Resources               │   │
│  │ - Crisis resources link                      │   │
│  │ - Contact information                        │   │
│  │ - Additional resources                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### Visual Design Principles

1. **Consistency**: Match existing page styles (Crisis, Privacy pages)
2. **Hierarchy**: Clear section headers with icons
3. **Readability**: Appropriate spacing, font sizes, and line heights
4. **Accessibility**: Proper semantic HTML, ARIA labels where needed
5. **Responsiveness**: Mobile-first approach with breakpoints at 768px and 1024px

### Color Scheme

Uses the existing Material Design 3 color tokens:
- `bg-background` - Main background
- `bg-surface-container-low` - Section backgrounds
- `text-on-surface` - Primary text
- `text-on-surface-variant` - Secondary text
- `text-primary` - Accent color for links and highlights
- `border-outline-variant` - Borders and dividers

### Typography

- **Headers**: Bold, larger font sizes (text-xl to text-3xl)
- **Body**: Regular weight, 15px base size
- **Lists**: Proper spacing and indentation
- **Links**: Primary color with underline on hover

## Content Structure

### Section 1: Introduction
- Welcome message
- Brief explanation of JPsyche's purpose
- Disclaimer about AI limitations

### Section 2: Core Features
- **Starting a Conversation**: How to begin chatting
- **Message Actions**: Copy, edit, text-to-speech
- **Chat Management**: Creating, renaming, deleting chats
- **Quick Suggestions**: Using the suggestion chips

### Section 3: Account Features
- **Guest Mode**: 3-message limit, no history
- **Authenticated Mode**: Unlimited chats, persistent history
- **Sign Up Benefits**: Why create an account

### Section 4: Privacy & Safety
- Data handling overview
- Link to full Privacy Policy
- Link to Crisis Resources
- Reminder that JPsyche is not a substitute for professional help

### Section 5: Getting Help
- Contact information
- Link to Terms of Service
- FAQ or common questions

## Error Handling

### Scenarios

1. **Navigation Errors**: If help content fails to load, show a fallback message
2. **Link Failures**: External links open in new tabs with proper error handling
3. **State Conflicts**: Ensure help view properly clears when switching to chat

### Error Messages

- Simple, user-friendly messages
- Provide alternative actions (e.g., "Return to chat")
- No technical jargon

## Testing Strategy

### Unit Tests
- Component renders correctly
- Props are handled properly
- Links navigate to correct destinations

### Integration Tests
- Help button in sidebar triggers help view
- Help view replaces chat interface
- Returning to chat restores previous state
- Sidebar highlights help when active

### Visual Regression Tests
- Help content displays correctly on mobile
- Help content displays correctly on tablet
- Help content displays correctly on desktop
- Dark mode styling is correct

### Accessibility Tests
- Keyboard navigation works
- Screen reader compatibility
- Proper heading hierarchy
- Sufficient color contrast

### User Acceptance Tests
- Users can find and access help easily
- Content is clear and helpful
- Navigation back to chat is intuitive
- Mobile experience is smooth

## Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Sidebar closes when help is opened
- Full-width sections
- Larger touch targets for links
- Reduced padding for space efficiency

### Tablet (768px - 1024px)
- Sidebar remains visible
- Optimized content width
- Balanced spacing

### Desktop (> 1024px)
- Maximum content width of 3xl (48rem)
- Generous spacing
- Sidebar always visible
- Hover states for interactive elements

## Animation and Transitions

### Entry Animations
- Fade in with slight upward motion (Framer Motion)
- Staggered section appearance
- Duration: 400ms with easing

### Exit Animations
- Fade out when switching to chat
- Duration: 200ms

### Micro-interactions
- Hover effects on links and buttons
- Smooth color transitions
- Icon animations on hover

## Accessibility Considerations

1. **Semantic HTML**: Use proper heading hierarchy (h1, h2, h3)
2. **ARIA Labels**: Add labels for icon-only buttons
3. **Keyboard Navigation**: All interactive elements are keyboard accessible
4. **Focus Management**: Proper focus indicators
5. **Screen Readers**: Descriptive text for all visual elements
6. **Color Contrast**: WCAG AA compliance minimum
7. **Text Scaling**: Content remains readable at 200% zoom

## Performance Considerations

1. **Code Splitting**: Help content component is lazy-loaded
2. **Static Content**: No API calls required
3. **Minimal Re-renders**: Memoization where appropriate
4. **Optimized Images**: Use SVG icons (Lucide React)
5. **CSS Optimization**: Tailwind's purge removes unused styles

## Future Enhancements

1. **Search Functionality**: Allow users to search help content
2. **Interactive Tutorials**: Step-by-step guides with highlights
3. **Video Guides**: Embedded tutorial videos
4. **Contextual Help**: Show relevant help based on user actions
5. **Feedback Mechanism**: "Was this helpful?" buttons
6. **Multi-language Support**: Translate help content
7. **Keyboard Shortcuts Guide**: Document available shortcuts
8. **Changelog**: Show recent feature updates

## Dependencies

### Existing Dependencies (No New Installations)
- `react` - Component framework
- `framer-motion` - Animations
- `lucide-react` - Icons
- `next/link` - Navigation
- `tailwindcss` - Styling

### No Additional Dependencies Required

## Implementation Notes

1. **Minimal Changes**: Modify existing components rather than creating new routes
2. **Backward Compatibility**: Ensure existing chat functionality is not affected
3. **Type Safety**: Use TypeScript for all new code
4. **Code Style**: Follow existing patterns in the codebase
5. **Comments**: Add clear comments for complex logic
6. **Testing**: Write tests before implementation where possible
