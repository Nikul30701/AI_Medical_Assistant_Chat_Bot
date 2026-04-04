from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password1 = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ["id", "full_name", "email", "password", "password1"]
        
    def validate_email(self, email):
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'Email is already exists!'})
        return email
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password1']:
            raise serializers.ValidationError({'password': "Password do not match!"})
        validate_password(attrs['password'])
        return attrs
        
    def create(self, validated_data):
        validated_data.pop('password1')
        return User.objects.create_user(**validated_data)
    

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "email", "created_at"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom serializer to use email instead of username for login"""
    username_field = 'email'
    
    def validate(self, attrs):
        # The parent class expects 'username' but we use 'email'
        # Map email to username field for the parent class
        email = attrs.get('email')
        if email:
            attrs['username'] = email
        return super().validate(attrs)
