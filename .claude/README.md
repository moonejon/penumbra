# Claude Code Configuration for Penumbra

This directory contains Claude Code configuration files for the Penumbra library management project.

## Files

- **config.json** - Project metadata, tech stack, conventions, and best practices
- **subagents.json** - Specialized subagent definitions for different development roles
- **commands/** - Custom slash commands for common tasks

## Specialized Subagents

This project has four specialized subagents that you can invoke for specific tasks:

### 1. frontend-dev
**Specialization:** React, Next.js, Material-UI, and frontend development

**Use for:**
- Building UI components
- Implementing Material-UI designs
- React state management
- Client/Server Component decisions
- Responsive layout work
- Form handling

**Example:**
```
@claude I need to build a new book sorting component. Use the frontend-dev subagent.
```

### 2. ux-designer
**Specialization:** User experience, design patterns, accessibility, and information architecture

**Use for:**
- Designing new features and user flows
- Improving existing UI/UX
- Accessibility audits
- Layout and wireframe design
- User interaction patterns
- Mobile/responsive design decisions

**Example:**
```
@claude Can you review the import flow and suggest UX improvements? Use the ux-designer subagent.
```

### 3. fullstack-dev
**Specialization:** End-to-end feature implementation (database, backend, frontend)

**Use for:**
- Adding complete new features
- Database schema changes
- Server action implementation
- API integration
- Authentication flows
- Full-stack architecture decisions

**Example:**
```
@claude I need to add a reading list feature. Use the fullstack-dev subagent.
```

### 4. debugger
**Specialization:** Systematic debugging, error analysis, and issue resolution

**Use for:**
- Fixing bugs and errors
- Performance issues
- Build failures
- Database query problems
- TypeScript errors
- API integration issues

**Example:**
```
@claude The book import is failing with a Prisma error. Use the debugger subagent.
```

## How to Use Subagents

### Method 1: Direct Request
Simply mention the subagent in your request:
```
@claude Use the frontend-dev subagent to create a new filter component
```

### Method 2: Via Task Tool
When Claude invokes the Task tool, it can specify the subagent type:
```
Just describe your task and Claude will determine if a specialized subagent would be helpful
```

## Custom Slash Commands

Use these commands to quickly access common workflows:

- **/dev** - Start the development server
- **/build** - Build the project and fix any errors
- **/db** - Database operations (migrations, Prisma commands)
- **/schema** - View and modify the Prisma schema
- **/add-feature** - Add a new feature following project patterns
- **/fix-bug** - Debug and fix issues systematically
- **/review** - Review code changes for quality and best practices

## Best Practices

1. **Use subagents for focused work** - They have specialized knowledge and approaches
2. **Combine subagents** - Use ux-designer for design, then frontend-dev for implementation
3. **Trust the debugger** - It follows a systematic methodology to find root causes
4. **Leverage fullstack-dev** - For features that span multiple layers of the application

## Project Conventions

Refer to `config.json` for detailed information about:
- Technology stack
- File structure patterns
- Coding conventions
- Best practices specific to Penumbra

## Updating Subagents

To modify subagent behavior, edit `subagents.json` and adjust:
- **name** - The identifier used to invoke the subagent
- **description** - Brief summary of the subagent's role
- **prompt** - Detailed instructions, context, and methodology for the subagent

Changes take effect immediately in new conversations.
