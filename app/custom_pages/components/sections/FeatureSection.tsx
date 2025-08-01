import { FeatureSection as FeatureSectionType } from '../../types/sections';
import { Volume2Icon, StarIcon, HeartIcon, CheckIcon, SparklesIcon } from 'lucide-react';
import { MediaTextSection } from './MediaTextSection';
import { useState } from 'react';
import MediaLibrary from '@/components/media/MediaLibrary';
import { TextStyleEditor, TextStyle } from './TextStyleEditor';
import { CSSProperties } from 'react';

interface FeatureSectionProps {
  section: FeatureSectionType;
  isEditMode: boolean;
  onSectionChange: (section: FeatureSectionType) => void;
  speakText: (text: string) => void;
}

function textStyleToCSS(style?: TextStyle): CSSProperties {
  if (!style) return {};
  const css: CSSProperties = {};
  if (style.fontColor) css.color = style.fontColor;
  if (style.fontSize) css.fontSize = style.fontSize;
  if (style.fontStyle) css.fontStyle = style.fontStyle;
  if (style.fontStyle === 'bold') css.fontWeight = 'bold';
  if (style.margin) css.margin = style.margin;
  if (style.textShadow) {
    css.textShadow = `${style.textShadow.offsetX || '2px'} ${style.textShadow.offsetY || '2px'} ${style.textShadow.blur || '4px'} ${style.textShadow.color || '#000000'}`;
  }
  if (style.textOutline) {
    // Not all browsers support WebkitTextStroke, but we can add it
    // @ts-ignore
    css.WebkitTextStroke = `${style.textOutline.width || '2px'} ${style.textOutline.color || '#ffffff'}`;
  }
  if (style.textBackground) {
    css.background = style.textBackground.color;
    css.opacity = style.textBackground.opacity;
    css.borderRadius = style.textBackground.borderRadius;
    css.padding = style.textBackground.padding;
    if (style.textBackground.blur) {
      css.backdropFilter = `blur(${style.textBackground.blur})`;
      // @ts-ignore
      css.WebkitBackdropFilter = `blur(${style.textBackground.blur})`;
    }
  }
  return css;
}

export function FeatureSection({ section, isEditMode, onSectionChange, speakText }: FeatureSectionProps) {
  const handleTitleChange = (title: string) => {
    onSectionChange({ ...section, title });
  };

  const handleDescriptionChange = (description: string) => {
    onSectionChange({ ...section, description });
  };

  const handleFeaturesChange = (features: Array<{
    icon: string;
    title: string;
    description: string;
    url?: string;
    openInNewTab?: boolean;
    textStyle?: TextStyle;
    ctaText?: string;
    ctaUrl?: string;
  }>) => {
    onSectionChange({ ...section, features });
  };

  const handleLayoutChange = (layout: 'grid' | 'list') => {
    onSectionChange({ ...section, layout });
  };

  const handleToggleTitleSpeech = (enableTitleSpeech: boolean) => {
    onSectionChange({ ...section, enableTitleSpeech });
  };

  const handleToggleDescriptionSpeech = (enableDescriptionSpeech: boolean) => {
    onSectionChange({ ...section, enableDescriptionSpeech });
  };

  const handleToggleFeatureSpeech = (enableFeatureSpeech: boolean) => {
    onSectionChange({ ...section, enableFeatureSpeech });
  };

  const handleFeatureTextStyleChange = (idx: number, style: TextStyle) => {
    const newFeatures = [...section.features];
    newFeatures[idx] = { ...newFeatures[idx], textStyle: { ...newFeatures[idx].textStyle, ...style } };
    handleFeaturesChange(newFeatures);
  };

  // State for which card's media is being edited
  const [editingMediaIdx, setEditingMediaIdx] = useState<number | null>(null);

  if (isEditMode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          {isEditMode && (
            <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
              <strong>Section ID:</strong> {section.id}
              <span className="ml-2 text-gray-500">(Use this for nav links)</span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Section Title"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id={`feature-title-speech-${section.id}`}
                  checked={section.enableTitleSpeech}
                  onChange={(e) => handleToggleTitleSpeech(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`feature-title-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
                  Enable TTS for title
                </label>
              </div>
            </div>

            {/* Title Text Style Editor */}
            <TextStyleEditor
              value={section.titleTextStyle || {}}
              onChange={style => onSectionChange({ ...section, titleTextStyle: { ...section.titleTextStyle, ...style } })}
              label="Title Text Style"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={section.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows={3}
                placeholder="Section Description"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id={`feature-description-speech-${section.id}`}
                  checked={section.enableDescriptionSpeech}
                  onChange={(e) => handleToggleDescriptionSpeech(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`feature-description-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
                  Enable TTS for description
                </label>
              </div>
            </div>

            {/* Description Text Style Editor */}
            <TextStyleEditor
              value={section.descriptionTextStyle || {}}
              onChange={style => onSectionChange({ ...section, descriptionTextStyle: { ...section.descriptionTextStyle, ...style } })}
              label="Description Text Style"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">Layout</label>
              <select
                value={section.layout}
                onChange={(e) => handleLayoutChange(e.target.value as 'grid' | 'list')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Features</label>
              <div className="mt-2 space-y-4">
                {section.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Icon</label>
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => {
                            const newFeatures = [...section.features];
                            newFeatures[index] = { ...feature, icon: e.target.value };
                            handleFeaturesChange(newFeatures);
                          }}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Icon name (e.g., star, heart, check)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => {
                            const newFeatures = [...section.features];
                            newFeatures[index] = { ...feature, title: e.target.value };
                            handleFeaturesChange(newFeatures);
                          }}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Feature Title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={feature.description}
                          onChange={(e) => {
                            const newFeatures = [...section.features];
                            newFeatures[index] = { ...feature, description: e.target.value };
                            handleFeaturesChange(newFeatures);
                          }}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          rows={2}
                          placeholder="Feature Description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CTA Text</label>
                        <input
                          type="text"
                          value={feature.ctaText || ''}
                          onChange={(e) => {
                            const newFeatures = [...section.features];
                            newFeatures[index] = { ...feature, ctaText: e.target.value };
                            handleFeaturesChange(newFeatures);
                          }}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Button Text (optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CTA URL</label>
                        <input
                          type="text"
                          value={feature.ctaUrl || ''}
                          onChange={(e) => {
                            const newFeatures = [...section.features];
                            newFeatures[index] = { ...feature, ctaUrl: e.target.value };
                            handleFeaturesChange(newFeatures);
                          }}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="https://example.com (optional)"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!feature.ctaOpenInNewTab}
                          onChange={e => {
                            const newFeatures = [...section.features];
                            newFeatures[index] = { ...feature, ctaOpenInNewTab: e.target.checked };
                            handleFeaturesChange(newFeatures);
                          }}
                          id={`feature-cta-newtab-${index}`}
                        />
                        <label htmlFor={`feature-cta-newtab-${index}`} className="text-sm">Open in new tab</label>
                      </div>
                      <TextStyleEditor
                        value={feature.textStyle || {}}
                        onChange={style => handleFeatureTextStyleChange(index, style)}
                        label="Feature Text Style"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newFeatures = section.features.filter((_, i) => i !== index);
                        handleFeaturesChange(newFeatures);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    handleFeaturesChange([
                      ...section.features,
                      { icon: '', title: '', description: '', textStyle: {}, ctaText: '', ctaUrl: '', ctaOpenInNewTab: false }
                    ]);
                  }}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Feature
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id={`feature-speech-${section.id}`}
                checked={section.enableFeatureSpeech}
                onChange={(e) => handleToggleFeatureSpeech(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`feature-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
                Enable TTS for feature descriptions
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderFeatures = () => {
    const getIcon = (iconName: string) => {
      switch (iconName) {
        case 'star': return <StarIcon className="w-6 h-6 text-yellow-400" />;
        case 'heart': return <HeartIcon className="w-6 h-6 text-pink-500" />;
        case 'check': return <CheckIcon className="w-6 h-6 text-green-500" />;
        case 'sparkles': return <SparklesIcon className="w-6 h-6 text-blue-400" />;
        default: return <StarIcon className="w-6 h-6 text-gray-400" />;
      }
    };

    if (section.layout === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">{getIcon(feature.icon)}</div>
              <div className="flex-1">
                <h4
                  className="font-semibold text-lg mb-1"
                  style={feature.textStyle ? {
                    color: feature.textStyle.fontColor,
                    fontSize: feature.textStyle.fontSize,
                    fontStyle: feature.textStyle.fontStyle,
                    fontWeight: feature.textStyle.fontStyle === 'bold' ? 'bold' : undefined,
                    textShadow: feature.textStyle.textShadow ? `${feature.textStyle.textShadow.offsetX || '2px'} ${feature.textStyle.textShadow.offsetY || '2px'} ${feature.textStyle.textShadow.blur || '4px'} ${feature.textStyle.textShadow.color || '#000000'}` : undefined,
                    WebkitTextStroke: feature.textStyle.textOutline ? `${feature.textStyle.textOutline.width || '2px'} ${feature.textStyle.textOutline.color || '#ffffff'}` : undefined,
                    background: feature.textStyle.textBackground ? feature.textStyle.textBackground.color : undefined,
                    opacity: feature.textStyle.textBackground ? feature.textStyle.textBackground.opacity : undefined,
                    borderRadius: feature.textStyle.textBackground ? feature.textStyle.textBackground.borderRadius : undefined,
                    padding: feature.textStyle.textBackground ? feature.textStyle.textBackground.padding : undefined,
                    backdropFilter: feature.textStyle.textBackground && feature.textStyle.textBackground.blur ? `blur(${feature.textStyle.textBackground.blur})` : undefined,
                    WebkitBackdropFilter: feature.textStyle.textBackground && feature.textStyle.textBackground.blur ? `blur(${feature.textStyle.textBackground.blur})` : undefined,
                  } : {}}
                >
                  {feature.title}
                </h4>
                <p
                  className="text-gray-600 mb-2"
                  style={feature.textStyle ? {
                    color: feature.textStyle.fontColor,
                    fontSize: feature.textStyle.fontSize,
                    fontStyle: feature.textStyle.fontStyle,
                    fontWeight: feature.textStyle.fontStyle === 'bold' ? 'bold' : undefined,
                    textShadow: feature.textStyle.textShadow ? `${feature.textStyle.textShadow.offsetX || '2px'} ${feature.textStyle.textShadow.offsetY || '2px'} ${feature.textStyle.textShadow.blur || '4px'} ${feature.textStyle.textShadow.color || '#000000'}` : undefined,
                    WebkitTextStroke: feature.textStyle.textOutline ? `${feature.textStyle.textOutline.width || '2px'} ${feature.textStyle.textOutline.color || '#ffffff'}` : undefined,
                    background: feature.textStyle.textBackground ? feature.textStyle.textBackground.color : undefined,
                    opacity: feature.textStyle.textBackground ? feature.textStyle.textBackground.opacity : undefined,
                    borderRadius: feature.textStyle.textBackground ? feature.textStyle.textBackground.borderRadius : undefined,
                    padding: feature.textStyle.textBackground ? feature.textStyle.textBackground.padding : undefined,
                    backdropFilter: feature.textStyle.textBackground && feature.textStyle.textBackground.blur ? `blur(${feature.textStyle.textBackground.blur})` : undefined,
                    WebkitBackdropFilter: feature.textStyle.textBackground && feature.textStyle.textBackground.blur ? `blur(${feature.textStyle.textBackground.blur})` : undefined,
                  } : {}}
                >
                  {feature.description}
                </p>
                {feature.ctaText && feature.ctaUrl && (
                  <a
                    href={feature.ctaUrl}
                    target={feature.ctaOpenInNewTab ? '_blank' : undefined}
                    rel={feature.ctaOpenInNewTab ? 'noopener noreferrer' : undefined}
                    className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    {feature.ctaText}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {section.features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
            <div className="flex-shrink-0">{getIcon(feature.icon)}</div>
            <div className="flex-1">
              <h4
                className="font-semibold text-lg mb-1"
                style={feature.textStyle ? {
                  color: feature.textStyle.fontColor,
                  fontSize: feature.textStyle.fontSize,
                  fontStyle: feature.textStyle.fontStyle,
                  fontWeight: feature.textStyle.fontStyle === 'bold' ? 'bold' : undefined,
                  textShadow: feature.textStyle.textShadow ? `${feature.textStyle.textShadow.offsetX || '2px'} ${feature.textStyle.textShadow.offsetY || '2px'} ${feature.textStyle.textShadow.blur || '4px'} ${feature.textStyle.textShadow.color || '#000000'}` : undefined,
                  WebkitTextStroke: feature.textStyle.textOutline ? `${feature.textStyle.textOutline.width || '2px'} ${feature.textStyle.textOutline.color || '#ffffff'}` : undefined,
                  background: feature.textStyle.textBackground ? feature.textStyle.textBackground.color : undefined,
                  opacity: feature.textStyle.textBackground ? feature.textStyle.textBackground.opacity : undefined,
                  borderRadius: feature.textStyle.textBackground ? feature.textStyle.textBackground.borderRadius : undefined,
                  padding: feature.textStyle.textBackground ? feature.textStyle.textBackground.padding : undefined,
                  backdropFilter: feature.textStyle.textBackground && feature.textStyle.textBackground.blur ? `blur(${feature.textStyle.textBackground.blur})` : undefined,
                  WebkitBackdropFilter: feature.textStyle.textBackground && feature.textStyle.textBackground.blur ? `blur(${feature.textStyle.textBackground.blur})` : undefined,
                } : {}}
              >
                {feature.title}
              </h4>
              <p
                className="text-gray-600 mb-2"
                style={feature.textStyle ? {
                  color: feature.textStyle.fontColor,
                  fontSize: feature.textStyle.fontSize,
                  fontStyle: feature.textStyle.fontStyle,
                  fontWeight: feature.textStyle.fontStyle === 'bold' ? 'bold' : undefined,
                  textShadow: feature.textStyle.textShadow ? `${feature.textStyle.textShadow.offsetX || '2px'} ${feature.textStyle.textShadow.offsetY || '2px'} ${feature.textStyle.textShadow.blur || '4px'} ${feature.textStyle.textShadow.color || '#000000'}` : undefined,
                  WebkitTextStroke: feature.textStyle.textOutline ? `${feature.textStyle.textOutline.width || '2px'} ${feature.textStyle.textOutline.color || '#ffffff'}` : undefined,
                  background: feature.textStyle.textBackground ? feature.textStyle.textBackground.color : undefined,
                  opacity: feature.textStyle.textBackground ? feature.textStyle.textBackground.opacity : undefined,
                  borderRadius: feature.textStyle.textBackground ? feature.textStyle.textBackground.borderRadius : undefined,
                  padding: feature.textStyle.textBackground ? feature.textStyle.textBackground.padding : undefined,
                  backdropFilter: feature.textStyle.textBackground && feature.textStyle.textBackground.blur ? `blur(${feature.textStyle.textBackground.blur})` : undefined,
                  WebkitBackdropFilter: feature.textStyle.textBackground && feature.textStyle.textBackground.blur ? `blur(${feature.textStyle.textBackground.blur})` : undefined,
                } : {}}
              >
                {feature.description}
              </p>
              {feature.ctaText && feature.ctaUrl && (
                <a
                  href={feature.ctaUrl}
                  target={feature.ctaOpenInNewTab ? '_blank' : undefined}
                  rel={feature.ctaOpenInNewTab ? 'noopener noreferrer' : undefined}
                  className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  {feature.ctaText}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {section.title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold" style={textStyleToCSS(section.titleTextStyle)}>{section.title}</h2>
          {section.enableTitleSpeech && (
            <button
              onMouseEnter={() => speakText(section.title)}
              className="text-current hover:opacity-80"
            >
              <Volume2Icon className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {section.description && (
        <div className="flex items-center justify-between mb-8">
          <p className="text-lg" style={textStyleToCSS(section.descriptionTextStyle)}>{section.description}</p>
          {section.enableDescriptionSpeech && (
            <button
              onMouseEnter={() => speakText(section.description)}
              className="text-current hover:opacity-80"
            >
              <Volume2Icon className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {renderFeatures()}
    </div>
  );
} 