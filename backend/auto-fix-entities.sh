#!/bin/bash

echo "🔧 Auto-fixing entity relationships..."

# Fix Property Entity
if grep -q "@ManyToOne.*createdBy" src/modules/inventory/entities/property.entity.ts; then
    echo "Fixing property.entity.ts..."
    # This is complex, better to do manually
fi

# Fix Tower Entity  
if grep -q "@ManyToOne.*createdBy" src/modules/inventory/entities/tower.entity.ts; then
    echo "Fixing tower.entity.ts..."
fi

# Fix Flat Entity
if grep -q "@ManyToOne.*createdBy" src/modules/inventory/entities/flat.entity.ts; then
    echo "Fixing flat.entity.ts..."
fi

echo "⚠️  Manual fix recommended - see instructions above"
