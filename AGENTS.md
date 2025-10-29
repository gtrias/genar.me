# OpenCode Agents Configuration

## Available Modes

### Plan Mode
- **Purpose**: Structured task planning and breakdown
- **Usage**: Automatically creates detailed task lists for complex requests
- **Triggers**: Multi-step tasks, complex feature implementation, refactoring

### Agent Mode  
- **Purpose**: Autonomous task execution
- **Usage**: Executes tasks independently with minimal supervision
- **Triggers**: Single focused tasks, well-defined requirements

## Project-Specific Configuration

### Astro Website Project
- **Framework**: Astro 5.15.2
- **Styling**: Tailwind CSS 4.1.16
- **Deployment**: Cloudflare Pages
- **TypeScript**: Enabled

### Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview build locally
- `npm run cf:build` - Build for Cloudflare Pages
- `npm run cf:preview` - Preview with Wrangler

### File Structure Patterns
- Pages: `src/pages/*.astro`
- Layouts: `src/layouts/*.astro`
- Styles: `src/styles/*.css`
- Components: `src/components/*.astro` (if added)

## Agent Behavior

### Plan Mode Behavior
1. Analyze request complexity
2. Create structured todo list
3. Break down into manageable steps
4. Identify dependencies
5. Suggest execution order

### Agent Mode Behavior
1. Execute tasks autonomously
2. Make informed decisions based on project context
3. Follow existing code conventions
4. Validate results before completion

## Quality Assurance
- Run `npm run build` after significant changes
- Check TypeScript compilation with `tsc --noEmit`
- Validate Astro syntax and structure
- Test responsive design with dev tools