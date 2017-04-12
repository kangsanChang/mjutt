from django import forms
from .models import Classitem

class ClassitemForm(forms.ModelForm):

    class Meta:
        model = Classitem
        exclude = ()
