import { useAuth } from '~/utils/auth';
import { z } from 'zod';
import { scopedLogger } from '~/utils/logger';

const log = scopedLogger('user-settings');

interface UserSettings {
  id: string;
  application_theme: string | null;
  application_language: string;
  default_subtitle_language: string | null;
  proxy_urls: string[];
  trakt_key: string | null;
  febbox_key: string | null;
  enable_thumbnails: boolean;
  enable_autoplay: boolean;
  enable_skip_credits: boolean;
  enable_discover: boolean;
  enable_featured: boolean;
  enable_details_modal: boolean;
  enable_image_logos: boolean;
  enable_carousel_view: boolean;
  source_order: string[];
  enable_source_order: boolean;
  proxy_tmdb: boolean;
}

const userSettingsSchema = z.object({
  applicationTheme: z.string().nullable().optional(),
  applicationLanguage: z.string().optional().default('en'),
  defaultSubtitleLanguage: z.string().nullable().optional(),
  proxyUrls: z.array(z.string()).nullable().optional(),
  traktKey: z.string().nullable().optional(),
  febboxKey: z.string().nullable().optional(),
  enableThumbnails: z.boolean().optional().default(false),
  enableAutoplay: z.boolean().optional().default(true),
  enableSkipCredits: z.boolean().optional().default(true),
  enableDiscover: z.boolean().optional().default(true),
  enableFeatured: z.boolean().optional().default(false),
  enableDetailsModal: z.boolean().optional().default(false),
  enableImageLogos: z.boolean().optional().default(true),
  enableCarouselView: z.boolean().optional().default(false),
  sourceOrder: z.array(z.string()).optional().default([]),
  enableSourceOrder: z.boolean().optional().default(false),
  proxyTmdb: z.boolean().optional().default(false),
});

export default defineEventHandler(async event => {
  const userId = event.context.params?.id;

  const session = await useAuth().getCurrentSession();

  if (session.user !== userId) {
    throw createError({
      statusCode: 403,
      message: 'Permission denied',
    });
  }

  // First check if user exists
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    });
  }

  if (event.method === 'GET') {
    try {
      const settings = await prisma.user_settings.findUnique({
        where: { id: userId },
      }) as unknown as UserSettings | null;

      return {
        id: userId,
        applicationTheme: settings?.application_theme || null,
        applicationLanguage: settings?.application_language || 'en',
        defaultSubtitleLanguage: settings?.default_subtitle_language || null,
        proxyUrls: settings?.proxy_urls.length === 0 ? null : settings?.proxy_urls || null,
        traktKey: settings?.trakt_key || null,
        febboxKey: settings?.febbox_key || null,
        enableThumbnails: settings?.enable_thumbnails ?? false,
        enableAutoplay: settings?.enable_autoplay ?? true,
        enableSkipCredits: settings?.enable_skip_credits ?? true,
        enableDiscover: settings?.enable_discover ?? true,
        enableFeatured: settings?.enable_featured ?? false,
        enableDetailsModal: settings?.enable_details_modal ?? false,
        enableImageLogos: settings?.enable_image_logos ?? true,
        enableCarouselView: settings?.enable_carousel_view ?? false,
        sourceOrder: settings?.source_order || [],
        enableSourceOrder: settings?.enable_source_order ?? false,
        proxyTmdb: settings?.proxy_tmdb ?? false,
      };
    } catch (error) {
      log.error('Failed to get user settings', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw createError({
        statusCode: 500,
        message: 'Failed to get user settings',
      });
    }
  }

  if (event.method === 'PUT') {
    try {
      const body = await readBody(event);
      log.info('Updating user settings', { userId, body });

      const validatedBody = userSettingsSchema.parse(body);

      const createData = {
        application_theme: validatedBody.applicationTheme ?? null,
        application_language: validatedBody.applicationLanguage,
        default_subtitle_language: validatedBody.defaultSubtitleLanguage ?? null,
        proxy_urls: validatedBody.proxyUrls === null ? [] : (validatedBody.proxyUrls || []),
        trakt_key: validatedBody.traktKey ?? null,
        febbox_key: validatedBody.febboxKey ?? null,
        enable_thumbnails: validatedBody.enableThumbnails,
        enable_autoplay: validatedBody.enableAutoplay,
        enable_skip_credits: validatedBody.enableSkipCredits,
        enable_discover: validatedBody.enableDiscover,
        enable_featured: validatedBody.enableFeatured,
        enable_details_modal: validatedBody.enableDetailsModal,
        enable_image_logos: validatedBody.enableImageLogos,
        enable_carousel_view: validatedBody.enableCarouselView,
        source_order: validatedBody.sourceOrder || [],
        enable_source_order: validatedBody.enableSourceOrder,
        proxy_tmdb: validatedBody.proxyTmdb,
      };

      const updateData: Partial<typeof createData> = {};
      if (Object.prototype.hasOwnProperty.call(body, 'applicationTheme')) updateData.application_theme = createData.application_theme;
      if (Object.prototype.hasOwnProperty.call(body, 'applicationLanguage')) updateData.application_language = createData.application_language;
      if (Object.prototype.hasOwnProperty.call(body, 'defaultSubtitleLanguage')) updateData.default_subtitle_language = createData.default_subtitle_language;
      if (Object.prototype.hasOwnProperty.call(body, 'proxyUrls')) updateData.proxy_urls = createData.proxy_urls;
      if (Object.prototype.hasOwnProperty.call(body, 'traktKey')) updateData.trakt_key = createData.trakt_key;
      if (Object.prototype.hasOwnProperty.call(body, 'febboxKey')) updateData.febbox_key = createData.febbox_key;
      if (Object.prototype.hasOwnProperty.call(body, 'enableThumbnails')) updateData.enable_thumbnails = createData.enable_thumbnails;
      if (Object.prototype.hasOwnProperty.call(body, 'enableAutoplay')) updateData.enable_autoplay = createData.enable_autoplay;
      if (Object.prototype.hasOwnProperty.call(body, 'enableSkipCredits')) updateData.enable_skip_credits = createData.enable_skip_credits;
      if (Object.prototype.hasOwnProperty.call(body, 'enableDiscover')) updateData.enable_discover = createData.enable_discover;
      if (Object.prototype.hasOwnProperty.call(body, 'enableFeatured')) updateData.enable_featured = createData.enable_featured;
      if (Object.prototype.hasOwnProperty.call(body, 'enableDetailsModal')) updateData.enable_details_modal = createData.enable_details_modal;
      if (Object.prototype.hasOwnProperty.call(body, 'enableImageLogos')) updateData.enable_image_logos = createData.enable_image_logos;
      if (Object.prototype.hasOwnProperty.call(body, 'enableCarouselView')) updateData.enable_carousel_view = createData.enable_carousel_view;
      if (Object.prototype.hasOwnProperty.call(body, 'sourceOrder')) updateData.source_order = createData.source_order;
      if (Object.prototype.hasOwnProperty.call(body, 'enableSourceOrder')) updateData.enable_source_order = createData.enable_source_order;
      if (Object.prototype.hasOwnProperty.call(body, 'proxyTmdb')) updateData.proxy_tmdb = createData.proxy_tmdb;

      log.info('Preparing to upsert settings', { userId, updateData, createData: { id: userId, ...createData } });

      const settings = await prisma.user_settings.upsert({
        where: { id: userId },
        update: updateData,
        create: {
          id: userId,
          ...createData,
        },
      }) as unknown as UserSettings;

      log.info('Settings updated successfully', { userId });

      return {
        id: userId,
        applicationTheme: settings.application_theme,
        applicationLanguage: settings.application_language,
        defaultSubtitleLanguage: settings.default_subtitle_language,
        proxyUrls: settings.proxy_urls.length === 0 ? null : settings.proxy_urls,
        traktKey: settings.trakt_key,
        febboxKey: settings.febbox_key,
        enableThumbnails: settings.enable_thumbnails,
        enableAutoplay: settings.enable_autoplay,
        enableSkipCredits: settings.enable_skip_credits,
        enableDiscover: settings.enable_discover,
        enableFeatured: settings.enable_featured,
        enableDetailsModal: settings.enable_details_modal,
        enableImageLogos: settings.enable_image_logos,
        enableCarouselView: settings.enable_carousel_view,
        sourceOrder: settings.source_order,
        enableSourceOrder: settings.enable_source_order,
        proxyTmdb: settings.proxy_tmdb,
      };
    } catch (error) {
      log.error('Failed to update user settings', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof z.ZodError) {
        throw createError({
          statusCode: 400,
          message: 'Invalid settings data',
          cause: error.errors,
        });
      }

      throw createError({
        statusCode: 500,
        message: 'Failed to update settings',
        cause: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  throw createError({
    statusCode: 405,
    message: 'Method not allowed',
  });
});
