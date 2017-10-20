<div class="grid-lg-4 grid-md-12 virtual-section-image">
    @if(!empty($section['section_image']['url']))
        <img src="{{ $section['section_image']['url'] }}" class="image" alt="{{ $section['section_title'] }}">
    @endif
</div>
