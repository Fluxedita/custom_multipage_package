import React, { useState } from 'react';
import type { ContactFormSection, FormField } from './types';
import { defaultFields } from './utils';
import { v4 as uuid } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const ESSENTIAL_NAMES = ['name', 'email', 'message'];

const FIELD_TYPES = [
  { type: 'text', label: 'Text' },
  { type: 'email', label: 'Email' },
  { type: 'textarea', label: 'Textarea' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'file', label: 'File Upload' },
];

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export default function ContactFormSectionEditor({ section, onSectionChange }: {
  section: ContactFormSection;
  onSectionChange: (section: ContactFormSection) => void;
}) {
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');

  // Form settings
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onSectionChange({ ...section, [name]: value });
  };

  // Field editing
  const handleFieldChange = (idx: number, field: Partial<FormField>) => {
    const updatedFields = section.fields.map((f, i) => i === idx ? { ...f, ...field } : f);
    onSectionChange({ ...section, fields: updatedFields });
  };

  const handleRemoveField = (idx: number) => {
    if (ESSENTIAL_NAMES.includes(section.fields[idx].name)) return;
    const updatedFields = section.fields.filter((_, i) => i !== idx);
    onSectionChange({ ...section, fields: updatedFields });
  };

  const handleAddField = () => {
    if (!newFieldLabel || !newFieldName) return;
    const newField: FormField = {
      id: uuid(),
      type: newFieldType as FormField['type'],
      label: newFieldLabel,
      name: newFieldName,
      required: newFieldRequired,
      placeholder: newFieldPlaceholder || undefined,
    };
    onSectionChange({ ...section, fields: [
      ...section.fields.slice(0, 1), // keep Name first
      ...section.fields.slice(1, section.fields.length - 1), // middle fields
      newField,
      section.fields[section.fields.length - 1], // keep Message last
    ] });
    setNewFieldLabel('');
    setNewFieldName('');
    setNewFieldRequired(false);
    setNewFieldPlaceholder('');
  };

  // Drag-and-drop
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const newFields = reorder(section.fields, result.source.index, result.destination.index);
    onSectionChange({ ...section, fields: newFields });
  };

  return (
    <div>
      <h3 className="font-bold text-lg mb-4">Edit Contact Form Section</h3>
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <label className="block mb-2 font-medium">Form Action URL
          <input
            className="block w-full border rounded p-2 mt-1"
            name="formAction"
            value={section.formAction}
            onChange={handleSettingsChange}
            placeholder="https://your-api-endpoint.com/contact"
          />
        </label>
        <label className="block mb-2 font-medium">Form Method
          <select
            className="block w-full border rounded p-2 mt-1"
            name="formMethod"
            value={section.formMethod}
            onChange={handleSettingsChange}
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>
        </label>
      </div>

      <h4 className="font-semibold mb-2">Fields</h4>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields-list">
          {(provided) => (
            <ul className="mb-4" ref={provided.innerRef} {...provided.droppableProps}>
              {section.fields.map((field, idx) => (
                <Draggable key={field.id} draggableId={field.id} index={idx}>
                  {(draggableProvided, snapshot) => (
                    <li
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                      className={`mb-3 p-3 border rounded bg-white flex flex-col gap-2 ${snapshot.isDragging ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex gap-2 items-center">
                        <span className="font-medium">{field.label}</span>
                        <span className="text-xs text-gray-500">({field.type})</span>
                        {ESSENTIAL_NAMES.includes(field.name) && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Essential</span>
                        )}
                        {!ESSENTIAL_NAMES.includes(field.name) && (
                          <button
                            className="ml-auto text-red-500 hover:underline"
                            onClick={() => handleRemoveField(idx)}
                            type="button"
                          >Remove</button>
                        )}
                        <span className="ml-2 cursor-move text-gray-400" title="Drag to reorder">↕️</span>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <label className="text-sm">Label
                          <input
                            className="ml-1 border rounded p-1"
                            value={field.label}
                            onChange={e => handleFieldChange(idx, { label: e.target.value })}
                            disabled={ESSENTIAL_NAMES.includes(field.name)}
                          />
                        </label>
                        <label className="text-sm">Name
                          <input
                            className="ml-1 border rounded p-1"
                            value={field.name}
                            onChange={e => handleFieldChange(idx, { name: e.target.value })}
                            disabled={ESSENTIAL_NAMES.includes(field.name)}
                          />
                        </label>
                        <label className="text-sm">Type
                          <select
                            className="ml-1 border rounded p-1"
                            value={field.type}
                            onChange={e => handleFieldChange(idx, { type: e.target.value as FormField['type'] })}
                            disabled={ESSENTIAL_NAMES.includes(field.name)}
                          >
                            {FIELD_TYPES.map(ft => (
                              <option key={ft.type} value={ft.type}>{ft.label}</option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm">Required
                          <input
                            className="ml-1"
                            type="checkbox"
                            checked={field.required}
                            onChange={e => handleFieldChange(idx, { required: e.target.checked })}
                            disabled={ESSENTIAL_NAMES.includes(field.name)}
                          />
                        </label>
                        <label className="text-sm">Placeholder
                          <input
                            className="ml-1 border rounded p-1"
                            value={field.placeholder || ''}
                            onChange={e => handleFieldChange(idx, { placeholder: e.target.value })}
                            disabled={field.type === 'checkbox' || ESSENTIAL_NAMES.includes(field.name)}
                          />
                        </label>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <div className="mb-4 p-4 border rounded bg-gray-50">
        <h5 className="font-semibold mb-2">Add New Field</h5>
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm">Type
            <select
              className="ml-1 border rounded p-1"
              value={newFieldType}
              onChange={e => setNewFieldType(e.target.value)}
            >
              {FIELD_TYPES.map(ft => (
                <option key={ft.type} value={ft.type}>{ft.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">Label
            <input
              className="ml-1 border rounded p-1"
              value={newFieldLabel}
              onChange={e => setNewFieldLabel(e.target.value)}
            />
          </label>
          <label className="text-sm">Name
            <input
              className="ml-1 border rounded p-1"
              value={newFieldName}
              onChange={e => setNewFieldName(e.target.value)}
            />
          </label>
          <label className="text-sm">Required
            <input
              className="ml-1"
              type="checkbox"
              checked={newFieldRequired}
              onChange={e => setNewFieldRequired(e.target.checked)}
            />
          </label>
          <label className="text-sm">Placeholder
            <input
              className="ml-1 border rounded p-1"
              value={newFieldPlaceholder}
              onChange={e => setNewFieldPlaceholder(e.target.value)}
              disabled={newFieldType === 'checkbox'}
            />
          </label>
          <button
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            type="button"
            onClick={handleAddField}
          >Add Field</button>
        </div>
      </div>
    </div>
  );
} 