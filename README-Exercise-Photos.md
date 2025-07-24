# Exercise Photos Integration Guide

## Overview

BoltLab now supports visual exercise demonstrations with photos and detailed instructions to help users perform exercises correctly and safely.

## File Structure

```
assets/
  images/
    exercises/
      ├── bench-press-demo.jpg       # Main demonstration image
      ├── bench-press-thumb.jpg      # Thumbnail for lists
      ├── bench-press-start.jpg      # Starting position (optional)
      ├── bench-press-end.jpg        # End position (optional)
      ├── push-ups-demo.gif          # Animated demonstration
      ├── push-ups-thumb.jpg         # Thumbnail
      ├── squat-demo.gif             # Animated demonstration
      ├── squat-thumb.jpg            # Thumbnail
      ├── squat-start.jpg            # Starting position
      ├── squat-end.jpg              # End position
      └── ... (more exercises)
```

## Image Requirements

### File Formats

- **Static Images**: JPG, PNG
- **Animated Demos**: GIF (preferred for movement demonstration)
- **Video Demos**: MP4 (optional, referenced via videoUrl)

### Image Specifications

- **Demonstration Images**: 800x600px minimum, 16:9 or 4:3 aspect ratio
- **Thumbnails**: 300x200px, optimized for fast loading
- **Start/End Position**: 600x400px minimum
- **File Size**:
  - Thumbnails: < 50KB
  - Demo images: < 200KB
  - GIFs: < 500KB

### Image Quality Guidelines

- **High contrast** for better visibility
- **Clear form demonstration** showing proper technique
- **Professional lighting** and clean background
- **Multiple angles** when beneficial (start/end positions)
- **Safety equipment** visible when required

## Adding Exercise Photos

### 1. Prepare Your Images

1. Take or source high-quality exercise photos/videos
2. Edit to meet specifications above
3. Name files using this convention:

   ```
   [exercise-id]-[type].[extension]

   Examples:
   - bench-press-demo.jpg
   - push-ups-thumb.jpg
   - squat-start.jpg
   - deadlift-demo.gif
   ```

### 2. Add Images to Assets

```bash
# Copy images to the exercises folder
cp your-exercise-photos/* assets/images/exercises/
```

### 3. Update Exercise Data

In `data/exercises.ts`, update each exercise with image paths:

```typescript
{
  id: 'bench-press',
  name: 'Bench Press',
  // ... other fields
  images: {
    demonstration: '/assets/images/exercises/bench-press-demo.jpg',
    thumbnail: '/assets/images/exercises/bench-press-thumb.jpg',
    startPosition: '/assets/images/exercises/bench-press-start.jpg', // optional
    endPosition: '/assets/images/exercises/bench-press-end.jpg',     // optional
  },
  instructions: {
    setup: [
      'Lie flat on the bench with your eyes under the barbell',
      'Grip the bar with hands slightly wider than shoulder-width',
      // ... more setup instructions
    ],
    execution: [
      'Unrack the bar and hold it over your chest',
      'Lower the bar slowly to your chest',
      // ... more execution instructions
    ],
    tips: [
      'Keep your core tight throughout the movement',
      // ... more tips
    ],
    commonMistakes: [
      'Flaring elbows too wide (90 degrees)',
      // ... more common mistakes
    ]
  },
  difficulty: 'intermediate',
  targetMuscles: ['Pectorals', 'Triceps', 'Anterior Deltoids'],
  videoUrl: 'https://your-video-host.com/bench-press-demo.mp4' // optional
}
```

## Exercise Instructions Format

### Setup Instructions

- Step-by-step positioning
- Equipment setup
- Safety considerations
- Body alignment cues

### Execution Instructions

- Movement phases
- Breathing patterns
- Speed/tempo guidance
- Range of motion

### Pro Tips

- Form optimization
- Advanced techniques
- Efficiency improvements
- Mental cues

### Common Mistakes

- Dangerous form errors
- Inefficient movements
- Beginner pitfalls
- Injury prevention

## Photo Sources

### Free Resources

- **Unsplash**: High-quality fitness photos
- **Pexels**: Exercise demonstration images
- **Pixabay**: Workout and fitness content

### Paid Resources

- **Shutterstock**: Professional exercise photography
- **Getty Images**: High-quality fitness content
- **Adobe Stock**: Diverse exercise demonstrations

### Creating Your Own

- **Equipment**: DSLR camera or high-quality smartphone
- **Lighting**: Natural light or professional studio setup
- **Background**: Clean, neutral background
- **Models**: Demonstrate proper form and safety

## Image Optimization

### Tools

- **TinyPNG**: Compress images without quality loss
- **GIMP**: Free image editing software
- **Photoshop**: Professional image editing
- **FFmpeg**: Convert videos to optimized GIFs

### Optimization Commands

```bash
# Compress images
pngquant --quality=65-80 input.png --output output.png

# Resize images
convert input.jpg -resize 800x600 output.jpg

# Create GIF from video
ffmpeg -i input.mp4 -vf "fps=10,scale=800:-1" -loop 0 output.gif
```

## Features Enabled by Images

### Exercise Cards

- Thumbnail previews in exercise lists
- Difficulty indicators with star ratings
- Target muscle visualization
- Equipment requirements

### Detailed Instructions Modal

- Full-size demonstration images
- Start/end position comparisons
- Step-by-step visual guidance
- Professional instruction overlay

### Active Workout Screen

- Real-time exercise demonstration
- Quick setup tips
- Form reminders during sets
- Visual progress tracking

## Testing Images

### Checklist

- [ ] Images load correctly on all screen sizes
- [ ] Fallback displays when images fail to load
- [ ] Loading performance is acceptable
- [ ] Images are accessible (alt text equivalent)
- [ ] Proper aspect ratios maintained

### Test Devices

- iOS simulators (various screen sizes)
- Android emulators (various densities)
- Physical devices for real-world testing

## Troubleshooting

### Common Issues

1. **Images not loading**: Check file paths and permissions
2. **Slow loading**: Optimize image sizes and formats
3. **Aspect ratio issues**: Ensure consistent dimensions
4. **Missing images**: Implement fallback placeholders

### Performance Tips

- Use thumbnail images for lists
- Lazy load large demonstration images
- Cache images for offline viewing
- Optimize image formats for mobile

## Legal Considerations

### Copyright

- Ensure proper licensing for all images
- Credit photographers when required
- Use royalty-free or creative commons content
- Consider liability for exercise demonstrations

### Model Releases

- Obtain proper releases for people in photos
- Ensure diversity and inclusion in imagery
- Consider accessibility requirements
- Follow platform guidelines for content

## Future Enhancements

### Planned Features

- **Video Integration**: MP4 video demonstrations
- **3D Animations**: Interactive exercise models
- **AR Overlays**: Real-time form correction
- **Multi-angle Views**: 360-degree exercise visualization
- **Progressive Demonstrations**: Beginner to advanced progressions

### Integration Points

- AI-powered form analysis
- Social sharing of exercise progress
- Custom workout creation with visual previews
- Achievement badges with exercise imagery

---

## ⚙️ API Setup for AI Features

### Google Gemini AI Setup

To use the AI workout generation and Bolt chatbot features, you need to set up a Google Gemini API key:

1. **Get a free API key**:

   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key

2. **Set up environment variables**:

   - Create a `.env` file in your project root
   - Add the following line:
     ```
     EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
     ```
   - Replace `your_actual_api_key_here` with the API key you copied

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

### Without API Key

If you don't set up the API key, the app will still work but will use mock data for:

- AI workout generation
- Bolt chatbot responses
- Workout modifications

### Troubleshooting

If you see errors like "ai.models.getGenerativeModel is not a function":

1. Make sure you have the correct package installed: `@google/generative-ai`
2. Verify your API key is correctly set in the `.env` file
3. Restart your development server
4. Check that your `.env` file is in the project root directory

---

## Quick Start Checklist

1. [ ] Create `assets/images/exercises/` folder
2. [ ] Add exercise images following naming convention
3. [ ] Update `data/exercises.ts` with image paths
4. [ ] Test images in ExerciseCard components
5. [ ] Verify ExerciseInstructions modal displays correctly
6. [ ] Check active workout screen shows images
7. [ ] Optimize images for performance
8. [ ] Test on multiple devices and screen sizes

For questions or assistance, refer to the component documentation in:

- `components/ExerciseCard.tsx`
- `components/ExerciseInstructions.tsx`
- `app/workout/active.tsx`
