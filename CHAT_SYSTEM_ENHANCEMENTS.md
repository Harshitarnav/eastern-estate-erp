# Chat System Enhancement Guide

## Issues Fixed
✅ **Notifications Backend 500 Error** - Added null checks in controller for missing userId

## Required Enhancements

### 1. Add "New Group" and "New Message" Buttons

Add to the Groups View header (after Search section):

```tsx
{/* Action Buttons */}
<div className="p-4 border-b flex space-x-2">
  <button
    onClick={() => setView('newGroup')}
    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    <Users className="w-4 h-4" />
    <span>New Group</span>
  </button>
  <button
    onClick={() => setView('newMessage')}
    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
  >
    <User className="w-4 h-4" />
    <span>New Message</span>
  </button>
</div>
```

### 2. Create Employee Service Integration

Create `frontend/src/services/employees.service.ts` if it doesn't exist with:

```typescript
import api from './api';

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  avatar?: string;
}

class EmployeesService {
  async getAll(): Promise<Employee[]> {
    const response = await api.get<Employee[]>('/employees');
    return response.data;
  }

  async search(query: string): Promise<Employee[]> {
    const response = await api.get<Employee[]>(`/employees/search?q=${query}`);
    return response.data;
  }
}

export default new EmployeesService();
```

### 3. Add New Views to ChatButton Component

Update state:
```tsx
const [view, setView] = useState<'groups' | 'chat' | 'newGroup' | 'newMessage'>('groups');
const [employees, setEmployees] = useState<Employee[]>([]);
const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
const [groupName, setGroupName] = useState('');
const [groupDescription, setGroupDescription] = useState('');
```

### 4. New Group View

```tsx
{view === 'newGroup' && (
  <>
    <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button onClick={() => setView('groups')} className="p-1 hover:bg-blue-700 rounded">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">New Group</h2>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            placeholder="What's this group about?"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Members *</label>
          <input
            type="text"
            placeholder="Search employees..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
            onChange={(e) => loadEmployees(e.target.value)}
          />
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            {employees.map((emp) => (
              <label key={emp.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEmployees([...selectedEmployees, emp.id]);
                    } else {
                      setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                    }
                  }}
                  className="mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium">{emp.fullName}</p>
                  <p className="text-sm text-gray-500">{emp.position}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="p-4 border-t">
      <button
        onClick={handleCreateGroup}
        disabled={!groupName.trim() || selectedEmployees.length === 0}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        Create Group ({selectedEmployees.length} members)
      </button>
    </div>
  </>
)}
```

### 5. New Message View (Direct Chat)

```tsx
{view === 'newMessage' && (
  <>
    <div className="bg-green-600 text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button onClick={() => setView('groups')} className="p-1 hover:bg-green-700 rounded">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">New Message</h2>
      </div>
    </div>

    <div className="p-4">
      <input
        type="text"
        placeholder="Search employees..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        onChange={(e) => loadEmployees(e.target.value)}
      />
    </div>

    <div className="flex-1 overflow-y-auto">
      {employees.map((emp) => (
        <button
          key={emp.id}
          onClick={() => handleStartDirectChat(emp.id)}
          className="w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-center space-x-3"
        >
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{emp.fullName}</p>
            <p className="text-sm text-gray-500">{emp.position} - {emp.department}</p>
          </div>
        </button>
      ))}
    </div>
  </>
)}
```

### 6. Handler Functions

```tsx
const loadEmployees = async (query: string = '') => {
  try {
    const data = query 
      ? await employeesService.search(query)
      : await employeesService.getAll();
    setEmployees(data);
  } catch (error) {
    console.error('Failed to load employees:', error);
  }
};

const handleCreateGroup = async () => {
  try {
    await chatService.createGroup({
      name: groupName,
      description: groupDescription,
      groupType: 'GROUP',
      participantEmployeeIds: selectedEmployees,
    });
    setGroupName('');
    setGroupDescription('');
    setSelectedEmployees([]);
    setView('groups');
    loadGroups();
  } catch (error) {
    console.error('Failed to create group:', error);
  }
};

const handleStartDirectChat = async (employeeId: string) => {
  try {
    const group = await chatService.createDirectChat(employeeId);
    setView('chat');
    setSelectedGroup(group);
    await loadMessages(group.id);
  } catch (error) {
    console.error('Failed to start direct chat:', error);
  }
};
```

### 7. Update Chat Service

Add to `frontend/src/services/chat.service.ts`:

```typescript
async createDirectChat(employeeId: string): Promise<ChatGroup> {
  const response = await api.post<ChatGroup>('/chat/groups/direct', {
    participantEmployeeIds: [employeeId],
  });
  return response.data;
}
```

## Implementation Steps

1. Fix notifications controller ✅ (DONE)
2. Create/update employees service
3. Add new buttons to groups view
4. Add newGroup and newMessage views
5. Add handler functions
6. Update chat service with createDirectChat
7. Test all functionality

## Testing Checklist

- [ ] Notifications load without 500 error
- [ ] "New Group" button visible
- [ ] "New Message" button visible  
- [ ] Can search and select employees
- [ ] Can create group with multiple members
- [ ] Can start direct chat with employee
- [ ] Group appears in list after creation
- [ ] Direct chat appears in list
- [ ] Messages work in both group and direct chats

## Backend Already Supports

- ✅ Create groups (POST /chat/groups)
- ✅ Add participants
- ✅ Direct messages (groupType: 'DIRECT')
- ✅ List employees (GET /employees)

All backend APIs are ready - only frontend UI needs enhancement!
