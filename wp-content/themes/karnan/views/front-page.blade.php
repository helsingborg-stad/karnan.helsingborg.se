@extends('templates.master')
@section('content')
@include ('partials/stripe')
@include ('partials/one-page/preloader')
@include ('partials/one-page/elevator')
@include ('partials/one-page/scroll-up')
<div id="one-page-content" class="parallax-enabled">
    <div class="layer-wrapper">
        <div class="layer depth-1 layer-gras">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/grass/jpg/400.jpg">
        </div>
        <div class="layer depth-2 layer-tower">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/karnan/png/400.png">
        </div>
        <div class="layer depth-1 layer-city-top">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/top/city/jpg/400.png">
        </div>
        <div class="layer depth-1 layer-greenarea-top">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/top/greenarea/png/400.png">
        </div>
        <div class="layer depth-2 layer-tower-top">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/top/tower/png/400.png">
        </div>
    </div>
    <div id="inner">
        @include ('partials/one-page/live-section')
        @if(is_array($sections) && !empty($sections))
        @foreach ($sections as $key => $section)
        <section data-section-name="{{ sanitize_title($section['section_title']) }}" class="onepage-section fluid-type">
            <div class="flex v-center full-height">
                <div class="container full-width">
                    <div class="grid">
                        <div class="grid-xs-12 grid-md-12">
                            <article class="full o-article o-article--section o-article--blue">
                                <header>
                                    <h2>
                                    {!! $section['section_title_span'] !!}
                                    <small>
                                    ({{ $section['height_indicator'] }}<?php _e("m", 'karnan'); ?>)
                                    </small>
                                    </h2>
                                </header>
                                <div class="content">
                                    <span class="hidden-xs hidden-sm">{!! $section['content'] !!}</span>
                                    <span class="hidden-md hidden-lg">{!! $section['content_truncated'] !!}</span>
                                    <p>

                                        <div class="nav-links horizontal white">

                                            @if(!empty($section['google_maps']))
                                                <a href="#modal-target-{{ sanitize_title($section['section_title']) }}-360">
                                                    <i class="pricon pricon-360"></i>
                                                    <span class="hidden-xs inline-block-sm"><?php _e("360-view", 'karnan'); ?></span>
                                                </a>
                                            @endif

                                            @if($section['show_live_icon'])
                                            <a id="go-to-live" href="#live-video-section">
                                                <i class="pricon pricon-camera"></i>
                                                <span class="hidden-xs inline-block-sm"><?php _e("Live video feed", 'karnan'); ?><span>
                                            </a>
                                            @endif

                                            <a href="#modal-target-{{ sanitize_title($section['section_title']) }}">
                                                <i class="pricon pricon-enter"></i>
                                                <span class="hidden-xs inline-block-sm"><?php _e("Guide", 'karnan'); ?><span>
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            @endforeach
            @endif
        </div>
    </div>
    @if(is_array($sections) && !empty($sections))
        @foreach ($sections as $key => $section)
            @include ('partials/one-page/modals/modal-content')
            @include ('partials/one-page/modals/modal-audio')

            @if(!empty($section['google_maps']))
                @include ('partials/one-page/modals/modal-360')
            @endif

        @endforeach
    @endif
    @include ('partials/one-page/scroll-down')
    @stop
