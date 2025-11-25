import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MoviePlayer } from '../MoviePlayer';

describe('MoviePlayer basic behavior', () => {
  const movie = {
    id: 'm1',
    title: 'Test Movie',
    description: 'A short test',
    videoUrl: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    genre: 'Drama',
    year: '2023'
  };

  beforeEach(() => {
    // Mock media methods that don't exist in jsdom
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => void 0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders and invokes play when video clicked', async () => {
    const { container } = render(<MoviePlayer movie={movie as any} onClose={() => {}} />);

    const video = container.querySelector('video') as HTMLVideoElement | null;
    expect(video).toBeTruthy();

    // click should attempt to play
    if (video) {
      fireEvent.click(video);
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    }
  });
});
