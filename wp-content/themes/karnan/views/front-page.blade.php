@extends('templates.master')
@section('content')
@include ('partials/stripe')
@include ('partials/one-page/elevator')
@include ('partials/one-page/scroll-up')
<div id="one-page-content" class="parallax-enabled">
    <div class="layer-wrapper">
        <div class="layer depth-1 layer-gras">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/grass-bottom-1.png">
        </div>
        <div class="layer depth-2 layer-tower">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/karnan-full-with-grass.png">
        </div>
        <div class="layer depth-1 layer-city-top">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/top-city-2.png">
        </div>
        <div class="layer depth-1 layer-greenarea-top">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/top-greenarea-2.png">
        </div>
        <div class="layer depth-2 layer-tower-top">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/image/top-tower-2.png">
        </div>
    </div>
    <div id="inner">
        <!--@include ('partials/one-page/live-section')-->
        @if(is_array($sections) && !empty($sections))
        @foreach ($sections as $key => $section)
        <section data-section-name="{{ sanitize_title($section['section_title']) }}" class="onepage-section fluid-type">
            <div class="flex v-center full-height">
                <div class="container full-width">
                    <div class="grid">
                        <div class="grid-xs-12 grid-md-12">
                            <article class="full">
                                <header>
                                    <h2>
                                    {!! $section['section_title_span'] !!}
                                    <small>
                                    ({{ $section['height_indicator'] }}<?php _e("m", 'karnan'); ?>)
                                    </small>
                                    </h2>
                                </header>
                                <div class="content">
                                    <p>Här måste du bara titta upp i taket, för när såg du åtta takbjälkar av ek senast? Och har du överhuvudtaget någonsin sett takbjälkar från 1300-talets början? Här är sådana. Våningen har främst fungerat som vaktvåning, i dag betalar du entré här.</p>
                                    <!--{!! $section['content'] !!}-->
                                    <p>
                                        <a href="#modal-target-{{ sanitize_title($section['section_title']) }}" class="btn btn-primary btn-block"><?php _e('Read more', 'karnan'); ?></a>
                                        <div class="nav-links horizontal white">
                                            <a href="#">
                                                <i class="pricon pricon-volume"></i>
                                                Virtuell guide
                                            </a>
                                            <a href="#">
                                                <i class="pricon pricon-volume"></i>
                                                Ljudguide
                                            </a>
                                            <a href="#">
                                                <i class="pricon pricon-volume"></i>
                                                Live kamera
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
        <div id="modal-target-{{ sanitize_title($section['section_title']) }}" class="modal modal-backdrop-white modal-large modal-karnan" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-content material-shadow-lg">
                <div class="modal-header">
                    <a class="btn btn-close" href="#close"></a>
                </div>
                <div class="modal-body container">
                    <div class="image hidden-xs hidden-sm">
                        @if(!empty($section['section_image']['url']))
                            <img src="{{ $section['section_image']['url'] }}" alt="{{ $section['section_title'] }}">
                        @endif
                    </div>
                    <div class="content">
                        <h2 class="modal-title">{{ $section['section_title'] }}</h2>
                        @if(!empty($section['section_image']['url']))
                        <img class="hidden-md hidden-lg" src="{{ $section['section_image']['url'] }}" alt="{{ $section['section_title'] }}">
                        @endif
                        {!! $section['content_guide'] !!}
                    </div>
                    @if(!empty($section['gallery']))
                    <div class="grid-md-12">
                        <ul class="image-gallery grid grid-gallery">
                            @foreach($section['gallery'] as $image)
                            <li class="grid-md-4 grid-xs-6">
                                <a class="box lightbox-trigger" href="{{ $image['sizes']['large'] }}">
                                    {!! wp_get_attachment_image($image['ID'], array('250', '170')) !!}
                                </a>
                            </li>
                            @endforeach
                        </ul>
                    </div>
                    @endif
                </div>
                <!--
                <div class="modal-footer">
                    <a href="#close" class="btn btn-default"><?php _e('Close', 'karnan'); ?></a>
                </div> -->
            </div><!-- /.modal-content -->
            <a href="#close" class="backdrop"></a>
        </div><!-- /.modal -->
        @endforeach
    @endif
    @include ('partials/one-page/scroll-down')
    @stop
