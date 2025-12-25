# Development Guide

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Add JSDoc comments to public functions
- Extract magic numbers to constants.ts
- Use type guards instead of assertions

### Adding Features

1. Add feature flag to constants.ts if configurable
2. Implement in appropriate util file
3. Add type definitions to types/
4. Update README with usage
5. Add tests

## Testing Recommendations

### Unit Tests

- Type guards (typeGuards.ts)
- Deep equality (deepEquals.ts)
- Debounce utility
- UUID generation

### Integration Tests

- Node CRUD operations
- Edge CRUD operations
- Layout calculations
- Save/load workflow

### E2E Tests

- Create graph workflow
- Edit node workflow
- Connect nodes workflow
- Search and highlight
- Theme toggle

## Common Issues

### Issue: Multiple instances conflict

**Solution**: Each instance has unique `instanceId`. Use `activeStoreId` to track focus.

### Issue: Zoom not working

**Solution**: Ensure `flowInstance` is set and `fitView` is called after mount.

### Issue: Handles not connecting

**Solution**: Check `isConnectable` on attributes and validate output→input direction.

### Issue: Layout doesn't update

**Solution**: Ensure `handleLayout` is called after node changes. Check `AUTO_LAYOUT_ON_COLLAPSE` flag.

### Issue: Theme not persisting

**Solution**: Theme store is volatile. Add localStorage sync if needed.
