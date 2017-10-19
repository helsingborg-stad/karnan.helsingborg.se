<?php global $post; ?>
@extends('templates.master')

@section('content')
<div class="hero" style="height: 300px; background-image:url('https://unsplash.it/1200/800/?image=513');">
@include ('partials/stripe')
</div>

<div class="container main-container">
    <div class="grid event-single">

        <div class="grid-lg-12">
            @if (! empty($date))
                <h1>{{ $date['date'] . ' ' . $date['month'] . ' ' . $date['year'] }}</h1>
            @endif
        </div>

        <div class="grid-md-5">
            @if (has_post_thumbnail())
                <img src="{{ the_post_thumbnail_url('large') }}" alt="{{ the_title() }}" class="image gutter gutter-bottom">
            @endif
        </div>
        <div class="grid-lg-7">
            {!! the_post() !!}
                <div class="gutter gutter-lg gutter-bottom" id="readspeaker-read">
                    <div class="post post-single">
                        <article id="article">
                            <h2 class="weight-medium">{{ the_title() }}</h2>
                            @include('partials.accessibility-menu')

                            @if (isset(get_extended($post->post_content)['main']) && !empty(get_extended($post->post_content)['main']) && isset(get_extended($post->post_content)['extended']) && !empty(get_extended($post->post_content)['extended']))

                                {!! apply_filters('the_lead', get_extended($post->post_content)['main']) !!}
                                {!! apply_filters('the_content', get_extended($post->post_content)['extended']) !!}

                            @else
                                {!! apply_filters('the_content', $post->post_content) !!}
                            @endif
                        </article>

                        {!! do_shortcode('[single_event_information]') !!}

                        @if (is_single() && is_active_sidebar('content-area'))
                            <div class="grid sidebar-content-area sidebar-content-area-bottom">
                                <?php dynamic_sidebar('content-area'); ?>
                            </div>
                        @endif
                    </div>
                </div>
        </div>

        <div class="grid-md-12 grid-lg-12">
            @include('partials.blog.post-footer')

            @if (is_single() && is_active_sidebar('content-area-top'))
                <div class="grid sidebar-content-area sidebar-content-area-top">
                    <?php dynamic_sidebar('content-area-top'); ?>
                </div>
            @endif

            @if (is_single() && comments_open())
                <div class="grid">
                    <div class="grid-sm-12">
                        @include('partials.blog.comments-form')
                    </div>
                </div>
                <div class="grid">
                    <div class="grid-sm-12">
                        @include('partials.blog.comments')
                    </div>
                </div>
            @endif
        </div>

        @include('partials.sidebar-right')
    </div>
</div>

@stop

