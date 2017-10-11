@extends('templates.master')

@section('content')

@include ('partials/backgroundvideo')

@include ('partials/elevator')

<div id="one-page-content">
    <div id="inner">
        @foreach ($sections as $section)
            <section id="{{ $section['section_anchor'] }}">
                <article>
                    <h1>{{ $section['post_title'] }}</h1>
                    {!! $section['post_content'] !!}
                </article>
            </section>
        @endforeach
    </div>
</div>

@stop
