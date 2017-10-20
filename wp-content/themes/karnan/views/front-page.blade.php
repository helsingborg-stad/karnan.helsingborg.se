@extends('templates.master')

@section('content')

@include ('partials/stripe')
@include ('partials/one-page/video')
@include ('partials/one-page/elevator')

@include ('partials/one-page/scroll-up')

<div id="one-page-content">
    <div id="inner">
        @foreach ($sections as $section)
            <section data-section-name="{{ sanitize_title($section['section_title']) }}" class="onepage-section" >
                <article class="box box-filled animate">
                    <span class="label"><span class="inner">{{ $section['section_title'] }}</span></span>
                    <div class="box-content">
                        <h5>{{ $section['section_title'] }}</h5>
                        {!! $section['content'] !!}
                    </div>
                </article>
            </section>
        @endforeach
    </div>
</div>

@include ('partials/one-page/scroll-down')

@stop
