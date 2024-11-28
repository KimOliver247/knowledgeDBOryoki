# Coding Standards

## Best Practices

### Component Structure
- Use modular, reusable components
- Maintain small file sizes
- Avoid single, large files for functionality
- Break down complex components into smaller, manageable pieces

### File Modifications
- Always provide complete, updated file content when making changes
- Never use placeholders or ellipsis
- Include all code, even unchanged parts
- Avoid any form of truncation or summarization
- Show the complete, up-to-date file contents when updating files

### Dependencies
- Always prioritize installing required dependencies by updating `package.json` first
- Dependencies will be auto-installed when `package.json` is updated
- Avoid using individual package installation commands

## Project Structure

### Components
- Place all React components in `src/components/`
- Each component should have its own file
- Use TypeScript for type safety
- Follow consistent naming conventions

### Styling
- Use Tailwind CSS for styling
- Follow the project's color scheme and design system
- Maintain consistent spacing and layout

### Icons
- Use Lucide React for icons
- Import only the icons needed
- Maintain consistent icon sizes

## Development Workflow

### Running Commands
- Use `type="start"` for commands that start or run the application
- Use `type="shell"` for other terminal commands
- Dev server will automatically restart when needed

### Version Control
- Keep commits focused and atomic
- Write clear commit messages
- Follow Git best practices